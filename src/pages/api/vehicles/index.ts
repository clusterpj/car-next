// File: src/pages/api/vehicles/index.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import dbConnect from '@/lib/db'
import Vehicle, { IVehicle, IVehicleProps } from '@/models/Vehicle'
import { withAuth } from '@/middleware/auth'
import { withRateLimit } from '@/middleware/rateLimit'
import { validateRequest } from '@/middleware/validateRequest'
import { createLogger } from '@/utils/logger'
import { corsMiddleware } from '@/middleware/cors'
import { sanitizeInput, sanitizeForRegex, SanitizedInput } from '@/utils/sanitizer';
import { MongoError } from 'mongodb'
import * as Yup from 'yup';

/**
 * Vehicle API Route Handler
 * 
 * This file handles GET, POST, PUT, and DELETE requests for the /api/vehicles endpoint.
 * GET: Retrieves a list of vehicles, with advanced filtering, sorting, and pagination.
 * POST: Creates a new vehicle (restricted to admin users).
 * PUT: Updates an existing vehicle (restricted to admin users).
 * DELETE: Removes a vehicle from the database (restricted to admin users).
 */

// Define the Yup schema for vehicle data
const vehicleSchema = Yup.object().shape({
  make: Yup.string().required('Make is required').max(100, 'Make must be at most 100 characters'),
  modelName: Yup.string().required('Model name is required').max(100, 'Model name must be at most 100 characters'), // Changed from 'model' to 'modelName'
  year: Yup.number().required('Year is required').min(1900, 'Year must be 1900 or later').max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  licensePlate: Yup.string().required('License plate is required').matches(/^[A-Z0-9]{5,8}$/, 'Invalid license plate format'),
  vin: Yup.string().required('VIN is required').matches(/^[A-HJ-NPR-Z0-9]{17}$/, 'Invalid VIN format'),
  color: Yup.string().required('Color is required').max(50, 'Color must be at most 50 characters'),
  mileage: Yup.number().required('Mileage is required').min(0, 'Mileage must be non-negative'),
  fuelType: Yup.string().required('Fuel type is required').oneOf(['gasoline', 'diesel', 'electric', 'hybrid'], 'Invalid fuel type'),
  transmission: Yup.string().required('Transmission is required').oneOf(['automatic', 'manual'], 'Invalid transmission type'),
  category: Yup.string().required('Category is required').oneOf(['economy', 'midsize', 'luxury', 'suv', 'van'], 'Invalid category'),
  dailyRate: Yup.number().required('Daily rate is required').min(0, 'Daily rate must be non-negative'),
  isAvailable: Yup.boolean(),
  features: Yup.array().of(Yup.string()),
  maintenanceHistory: Yup.array().of(
    Yup.object().shape({
      date: Yup.date().required('Maintenance date is required'),
      description: Yup.string().required('Maintenance description is required'),
      cost: Yup.number().required('Maintenance cost is required').min(0, 'Cost must be non-negative'),
    })
  ),
  images: Yup.array().of(Yup.string().url('Invalid image URL')),
  lastServiced: Yup.date(),
  nextServiceDue: Yup.date(),
});

const logger = createLogger('vehicles-api')

function calculateNextServiceDue(lastServiced: Date | string | number): Date {
  const date = new Date(lastServiced);
  if (isNaN(date.getTime())) {
    throw new ApiError(400, 'Invalid lastServiced date');
  }
  return new Date(date.getTime() + 90 * 24 * 60 * 60 * 1000);
}

class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

interface MongoQuery {
  make?: RegExp;
  modelName?: RegExp;
  year?: number;
  licensePlate?: string;
  vin?: string;
  color?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  category?: string;
  dailyRate?: {
    $gte?: number;
    $lte?: number;
  };
  isAvailable?: boolean;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

interface PaginatedVehicleResponse {
  vehicles: IVehicle[];
  totalPages: number;
  currentPage: number;
  totalVehicles: number;
}

interface SuccessResponse {
  success: true;
  message: string;
}

const validateVehicleData = async (data: Record<string, unknown>, isUpdate: boolean = false): Promise<{ isValid: boolean; errors: string[] }> => {
  try {
    const schemaKeys = Object.keys(vehicleSchema.fields) as Array<keyof typeof vehicleSchema.fields>;
    const validKeys = Object.keys(data).filter((key): key is keyof typeof vehicleSchema.fields => schemaKeys.includes(key as any));
    
    const schemaToValidate = isUpdate
      ? vehicleSchema.pick(validKeys)
      : vehicleSchema;

    await schemaToValidate.validate(data, { abortEarly: false });
    return { isValid: true, errors: [] };
  } catch (error: unknown) {
    if (error instanceof Yup.ValidationError) {
      return {
        isValid: false,
        errors: error.inner.map(err => err.message),
      };
    }
    return { isValid: false, errors: ['An unexpected error occurred during validation'] };
  }
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedVehicleResponse | IVehicle | ErrorResponse | SuccessResponse>
) {
  if (!req.socket) {
    req.socket = {} as any;
  }
  try {
    await dbConnect();

    let result;
    switch (req.method) {
      case 'GET':
        result = await handleGet(req);
        res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
        res.status(200).json(result);
        break;
      case 'POST':
        result = await handlePost(req);
        res.status(201).json(result);
        break;
      case 'PUT':
        result = await handlePut(req);
        res.status(200).json(result);
        break;
      case 'DELETE':
        await handleDelete(req);
        res.status(200).json({ success: true, message: 'Vehicle deleted successfully' } as SuccessResponse);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        throw new ApiError(405, `Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    handleError(error, res);
  }
}

async function handleGet(req: NextApiRequest): Promise<PaginatedVehicleResponse> {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    make,
    modelName,
    year,
    minDailyRate,
    maxDailyRate,
    isAvailable,
    category,
    fuelType,
    transmission,
    fields
  } = sanitizeInput(req.query) as Record<string, SanitizedInput>;

  const skip = (Number(page) - 1) * Number(limit);

  const query: MongoQuery = {};
  if (make) query.make = new RegExp(sanitizeForRegex(make as string), 'i');
  if (modelName) query.modelName = new RegExp(sanitizeForRegex(modelName as string), 'i');
  if (year) query.year = Number(year);
  if (minDailyRate || maxDailyRate) {
    query.dailyRate = {};
    if (minDailyRate) query.dailyRate.$gte = Number(minDailyRate);
    if (maxDailyRate) query.dailyRate.$lte = Number(maxDailyRate);
  }
  if (isAvailable === 'true') query.isAvailable = true;
  if (category) query.category = category as string;
  if (fuelType) query.fuelType = fuelType as string;
  if (transmission) query.transmission = transmission as string;
  
  const sortOptions: Record<string, 1 | -1> = {
  [(sanitizeInput(sortBy as string) || 'createdAt') as string]: sortOrder === 'asc' ? 1 : -1
  };


  const projection: Record<string, 1> = fields
    ? Object.fromEntries((fields as string).split(',').map(field => [field.trim(), 1]))
    : {};

  const [vehicles, total] = await Promise.all([
    Vehicle.find(query)
      .select(projection)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean()
      .exec(),
    Vehicle.countDocuments(query)
  ]);

  return {
    vehicles: vehicles as IVehicle[],
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    totalVehicles: total
  };
}

async function handlePost(req: NextApiRequest): Promise<IVehicle> {
  const session = await getSession({ req });
  if (!session?.user?.role || session.user.role !== 'admin') {
    throw new ApiError(403, 'Unauthorized: Admin access required');
  }

  const sanitizedBody = sanitizeInput(req.body) as Record<string, unknown>;

  const vehicleData: Partial<IVehicleProps> = {
    make: sanitizedBody.make as string,
    modelName: sanitizedBody.modelName as string,
    year: Number(sanitizedBody.year),
    licensePlate: sanitizedBody.licensePlate as string,
    vin: sanitizedBody.vin as string,
    color: sanitizedBody.color as string,
    mileage: Number(sanitizedBody.mileage),
    fuelType: sanitizedBody.fuelType as 'gasoline' | 'diesel' | 'electric' | 'hybrid',
    transmission: sanitizedBody.transmission as 'automatic' | 'manual',
    category: sanitizedBody.category as 'economy' | 'midsize' | 'luxury' | 'suv' | 'van',
    dailyRate: Number(sanitizedBody.dailyRate),
    isAvailable: Boolean(sanitizedBody.isAvailable),
    features: Array.isArray(sanitizedBody.features) 
      ? sanitizedBody.features.map(feature => sanitizeInput(feature) as string)
      : [],
      maintenanceHistory: Array.isArray(sanitizedBody.maintenanceHistory)
      ? sanitizedBody.maintenanceHistory.map(record => {
          const sanitizedDate = sanitizeInput(record.date);
          let date: Date;
    
          if (sanitizedDate instanceof Date) {
            date = sanitizedDate;
          } else if (typeof sanitizedDate === 'string' || typeof sanitizedDate === 'number') {
            const parsedDate = new Date(sanitizedDate);
            date = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
          } else {
            date = new Date(); // Fallback to current date if invalid
          }
    
          const description = sanitizeInput(record.description);
          const cost = sanitizeInput(record.cost);
    
          return {
            date,
            description: typeof description === 'string' ? description : '',
            cost: typeof cost === 'number' ? cost : 0,
          };
        })
      : [],
    images: Array.isArray(sanitizedBody.images)
      ? sanitizedBody.images.map(image => sanitizeInput(image) as string)
      : [],
  };

  if (sanitizedBody.lastServiced) {
    const lastServiced = sanitizeInput(sanitizedBody.lastServiced);
    if (typeof lastServiced === 'string' && !isNaN(Date.parse(lastServiced))) {
      vehicleData.lastServiced = new Date(lastServiced);
      vehicleData.nextServiceDue = calculateNextServiceDue(vehicleData.lastServiced);
    } else {
      throw new ApiError(400, 'Invalid lastServiced date');
    }
  }

  const { isValid, errors } = await validateVehicleData(vehicleData);
  if (!isValid) {
    throw new ApiError(400, `Validation failed: ${errors.join(', ')}`);
  }

  const vehicle = await Vehicle.create(vehicleData);
  logger.info(`New vehicle created: ${vehicle._id}`);
  return vehicle.toObject() as IVehicle;
}

async function handlePut(req: NextApiRequest): Promise<IVehicle> {
  const session = await getSession({ req });
  if (!session?.user?.role || session.user.role !== 'admin') {
    throw new ApiError(403, 'Unauthorized: Admin access required');
  }

  const { id } = sanitizeInput(req.query) as Record<string, unknown>;
  if (!id || typeof id !== 'string') {
    throw new ApiError(400, 'Vehicle ID is required');
  }

  const sanitizedBody = sanitizeInput(req.body) as Record<string, unknown>;

  const updateData: Partial<IVehicleProps> = {};

  // Only include fields that are present in the request body
  if (sanitizedBody.make) updateData.make = sanitizedBody.make as string;
  if (sanitizedBody.modelName) updateData.modelName = sanitizedBody.modelName as string;
  if (sanitizedBody.year) updateData.year = Number(sanitizedBody.year);
  if (sanitizedBody.licensePlate) updateData.licensePlate = sanitizedBody.licensePlate as string;
  if (sanitizedBody.vin) updateData.vin = sanitizedBody.vin as string;
  if (sanitizedBody.color) updateData.color = sanitizedBody.color as string;
  if (sanitizedBody.mileage) updateData.mileage = Number(sanitizedBody.mileage);
  if (sanitizedBody.fuelType) updateData.fuelType = sanitizedBody.fuelType as 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  if (sanitizedBody.transmission) updateData.transmission = sanitizedBody.transmission as 'automatic' | 'manual';
  if (sanitizedBody.category) updateData.category = sanitizedBody.category as 'economy' | 'midsize' | 'luxury' | 'suv' | 'van';
  if (sanitizedBody.dailyRate) updateData.dailyRate = Number(sanitizedBody.dailyRate);
  if (sanitizedBody.isAvailable !== undefined) updateData.isAvailable = Boolean(sanitizedBody.isAvailable);
  
  if (Array.isArray(sanitizedBody.features)) {
    updateData.features = sanitizedBody.features.map(feature => sanitizeInput(feature) as string);
  }
  
  if (Array.isArray(sanitizedBody.maintenanceHistory)) {
  updateData.maintenanceHistory = sanitizedBody.maintenanceHistory.map(record => {
    const sanitizedDate = sanitizeInput(record.date);
    let date: Date;

    if (sanitizedDate instanceof Date) {
      date = sanitizedDate;
    } else if (typeof sanitizedDate === 'string' || typeof sanitizedDate === 'number') {
      const parsedDate = new Date(sanitizedDate);
      date = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    } else {
      date = new Date(); // Fallback to current date if invalid
    }

    const description = sanitizeInput(record.description);
    const cost = sanitizeInput(record.cost);

    return {
      date,
      description: typeof description === 'string' ? description : '',
      cost: typeof cost === 'number' ? Number(cost) : 0,
    };
  });
}

  
  if (Array.isArray(sanitizedBody.images)) {
    updateData.images = sanitizedBody.images.map(image => sanitizeInput(image) as string);
  }

  if (sanitizedBody.lastServiced) {
    const lastServiced = sanitizeInput(sanitizedBody.lastServiced);
    if (typeof lastServiced === 'string' && !isNaN(Date.parse(lastServiced))) {
      updateData.lastServiced = new Date(lastServiced);
      updateData.nextServiceDue = calculateNextServiceDue(updateData.lastServiced);
    } else {
      throw new ApiError(400, 'Invalid lastServiced date');
    }
  }

  const { isValid, errors } = await validateVehicleData(updateData, true);
  if (!isValid) {
    throw new ApiError(400, `Validation failed: ${errors.join(', ')}`);
  }

  const updatedVehicle = await Vehicle.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedVehicle) {
    throw new ApiError(404, `Vehicle not found: ID ${id}`);
  }

  logger.info(`Vehicle updated: ${id}`);
  return updatedVehicle.toObject() as IVehicle;
}


async function handleDelete(req: NextApiRequest): Promise<{ success: true; message: string }> {
  const session = await getSession({ req });
  if (!session?.user?.role || session.user.role !== 'admin') {
    throw new ApiError(403, 'Unauthorized: Admin access required');
  }

  const { id } = sanitizeInput(req.query) as Record<string, unknown>;
  if (!id || typeof id !== 'string') {
    throw new ApiError(400, 'Vehicle ID is required');
  }

  const deletedVehicle = await Vehicle.findByIdAndDelete(id);

  if (!deletedVehicle) {
    throw new ApiError(404, `Vehicle not found: ID ${id}`);
  }

  logger.info(`Vehicle deleted: ${id}`);
  return { success: true, message: 'Vehicle deleted successfully' };
}

function handleError(error: unknown, res: NextApiResponse) {
  logger.error('API Error:', error);

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
  } else if (error instanceof MongoError) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'Duplicate key error. This item already exists.' });
    } else {
      res.status(500).json({ success: false, message: 'Database error occurred' });
    }
  } else if (error instanceof Error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  } else {
    res.status(500).json({ success: false, message: 'An unknown error occurred' });
  }
}

export default corsMiddleware(withRateLimit(withAuth(validateRequest(handler))));