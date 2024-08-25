// File: src/pages/api/vehicles/index.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import dbConnect from '@/lib/db'
import Vehicle, { IVehicle } from '@/models/Vehicle'
import { withAuth } from '@/middleware/auth'
import { withRateLimit } from '@/middleware/rateLimit'
import { validateRequest } from '@/middleware/validateRequest'
import { createLogger } from '@/utils/logger'
import { corsMiddleware } from '@/middleware/cors'
import { sanitizeInput, sanitizeForRegex } from '@/utils/sanitizer';
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
  model: Yup.string().required('Model is required').max(100, 'Model must be at most 100 characters'),
  year: Yup.number().required('Year is required').min(1900, 'Year must be 1900 or later').max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  licensePlate: Yup.string().required('License plate is required').max(20, 'License plate must be at most 20 characters'),
  dailyRate: Yup.number().required('Daily rate is required').min(0, 'Daily rate must be non-negative'),
  isAvailable: Yup.boolean(),
  color: Yup.string().max(50, 'Color must be at most 50 characters'),
  mileage: Yup.number().min(0, 'Mileage must be non-negative'),
  fuelType: Yup.string().oneOf(['petrol', 'diesel', 'electric', 'hybrid'], 'Invalid fuel type'),
  transmission: Yup.string().oneOf(['manual', 'automatic'], 'Invalid transmission type'),
  features: Yup.array().of(Yup.string()),
  imageUrl: Yup.string().url('Invalid image URL'),
});

class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const logger = createLogger('vehicles-api')

interface MongoQuery {
  make?: RegExp;
  model?: RegExp;
  year?: number;
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
  } catch (error) {
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
    model,
    year,
    minDailyRate,
    maxDailyRate,
    isAvailable,
    fields
  } = sanitizeInput(req.query) as Record<string, unknown>;

  const skip = (Number(page) - 1) * Number(limit);

  const query: MongoQuery = {};
  if (make) query.make = new RegExp(sanitizeForRegex(make as string), 'i');
  if (model) query.model = new RegExp(sanitizeForRegex(model as string), 'i');
  if (year) query.year = Number(year);
  if (minDailyRate || maxDailyRate) {
    query.dailyRate = {};
    if (minDailyRate) query.dailyRate.$gte = Number(minDailyRate);
    if (maxDailyRate) query.dailyRate.$lte = Number(maxDailyRate);
  }
  if (isAvailable === 'true') query.isAvailable = true;
  
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
  const { isValid, errors } = await validateVehicleData(sanitizedBody);
  if (!isValid) {
    throw new ApiError(400, `Validation failed: ${errors.join(', ')}`);
  }

  const vehicle = await Vehicle.create(sanitizedBody);
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
  const { isValid, errors } = await validateVehicleData(sanitizedBody, true);
  if (!isValid) {
    throw new ApiError(400, `Validation failed: ${errors.join(', ')}`);
  }

  const updatedVehicle = await Vehicle.findByIdAndUpdate(
    id,
    { $set: sanitizedBody },
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