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
import { sanitizeInput, sanitizeForRegex } from '@/utils/sanitizer'

const logger = createLogger('vehicles-api')

/**
 * Vehicle API Route Handler
 * 
 * This file handles GET, POST, PUT, and DELETE requests for the /api/vehicles endpoint.
 * GET: Retrieves a list of vehicles, with advanced filtering, sorting, and pagination.
 * POST: Creates a new vehicle (restricted to admin users).
 * PUT: Updates an existing vehicle (restricted to admin users).
 * DELETE: Removes a vehicle from the database (restricted to admin users).
 */

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


// Helper function to validate vehicle data
const validateVehicleData = (data: any, isUpdate: boolean = false) => {
  const errors = [];
  if (!isUpdate || data.make !== undefined) {
    if (!data.make) errors.push('Make is required');
  }
  if (!isUpdate || data.model !== undefined) {
    if (!data.model) errors.push('Model is required');
  }
  if (!isUpdate || data.year !== undefined) {
    if (!data.year || isNaN(data.year)) errors.push('Valid year is required');
  }
  if (!isUpdate || data.licensePlate !== undefined) {
    if (!data.licensePlate) errors.push('License plate is required');
  }
  if (!isUpdate || data.dailyRate !== undefined) {
    if (!data.dailyRate || isNaN(data.dailyRate)) errors.push('Valid daily rate is required');
  }
  return errors;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedVehicleResponse | IVehicle | ErrorResponse>
) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
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

        // Build the query object
        const query: Record<string, unknown> = {};
        if (make) query.make = new RegExp(sanitizeForRegex(make as string), 'i');
        if (model) query.model = new RegExp(sanitizeForRegex(model as string), 'i');
        if (year) query.year = Number(year);
        if (minDailyRate || maxDailyRate) {
          query.dailyRate = {};
          if (minDailyRate) query.dailyRate.$gte = Number(minDailyRate);
          if (maxDailyRate) query.dailyRate.$lte = Number(maxDailyRate);
        }
        if (isAvailable === 'true') query.isAvailable = true;

        // Build the sort options
        const sortOptions: Record<string, 1 | -1> = {};
        sortOptions[sanitizeInput(sortBy as string) as string] = sortOrder === 'asc' ? 1 : -1;

        // Build the projection object for field selection
        const projection: Record<string, 1 | 0> = {};
        if (fields) {
          (fields as string).split(',').forEach(field => {
            projection[field.trim()] = 1;
          });
        }


        const vehiclesPromise = Vehicle.find(query)
        .select(projection)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .exec();
  
      const totalPromise = Vehicle.countDocuments(query);
  
      const [vehicles, total] = await Promise.all([vehiclesPromise, totalPromise]);

      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
      res.status(200).json({
        vehicles: vehicles as IVehicle[],
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        totalVehicles: total
      });
    } catch (error) {
      logger.error('Error fetching vehicles:', error);
      res.status(500).json({ success: false, message: 'Error fetching vehicles' });
    }
    break;

      case 'POST':
        try {
          const session = await getSession({ req });
          if (!session || session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
          }
  
          const sanitizedBody = sanitizeInput(req.body) as Record<string, unknown>;
          const validationErrors = validateVehicleData(sanitizedBody);
          if (validationErrors.length > 0) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validationErrors });
          }
  
          const vehicle = await Vehicle.create(sanitizedBody);
          logger.info(`New vehicle created: ${vehicle._id}`);
          res.status(201).json(vehicle as IVehicle);
        } catch (error) {
          logger.error('Error creating vehicle:', error);
          if (error instanceof Error && 'code' in error && error.code === 11000) {
            res.status(400).json({ success: false, message: 'Vehicle with this license plate already exists' });
          } else {
            res.status(500).json({ success: false, message: 'Error creating vehicle' });
          }
        }
        break;

        case 'PUT':
          try {
            const session = await getSession({ req });
            if (!session || session.user.role !== 'admin') {
              return res.status(403).json({ success: false, message: 'Unauthorized' });
            }
    
            const { id } = sanitizeInput(req.query) as Record<string, unknown>;
            if (!id || typeof id !== 'string') {
              return res.status(400).json({ success: false, message: 'Vehicle ID is required' });
            }
    
            const sanitizedBody = sanitizeInput(req.body) as Record<string, unknown>;
            const validationErrors = validateVehicleData(sanitizedBody, true);
            if (validationErrors.length > 0) {
              return res.status(400).json({ success: false, message: 'Validation failed', errors: validationErrors });
            }
    
            const updatedVehicle = await Vehicle.findByIdAndUpdate(
              id,
              { $set: sanitizedBody },
              { new: true, runValidators: true }
            );
    
            if (!updatedVehicle) {
              return res.status(404).json({ success: false, message: 'Vehicle not found' });
            }

        logger.info(`Vehicle updated: ${id}`);
        res.status(200).json(updatedVehicle as IVehicle);
      } catch (error) {
        logger.error('Error updating vehicle:', error);
        if (error instanceof Error) {
          if ('kind' in error && error.kind === 'ObjectId') {
          res.status(400).json({ success: false, message: 'Invalid vehicle ID format' });
          } else if ('code' in error && error.code === 11000) {
          res.status(400).json({ success: false, message: 'License plate already in use' });
        } else {
          res.status(500).json({ success: false, message: 'Error updating vehicle' });
        }
        } else {
          res.status(500).json({ success: false, message: 'Unknown error occurred' });
        }
      }
      break;

      case 'DELETE':
        try {
          const session = await getSession({ req });
          if (!session || session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
          }
  
          const { id } = sanitizeInput(req.query) as Record<string, unknown>;
          if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, message: 'Vehicle ID is required' });
          }
  
          const deletedVehicle = await Vehicle.findByIdAndDelete(id);
  
          if (!deletedVehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
          }
  
          logger.info(`Vehicle deleted: ${id}`);
          res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
        } catch (error) {
        logger.error('Error deleting vehicle:', error);
        if (error instanceof Error) {
          if ('kind' in error && error.kind === 'ObjectId') {
          res.status(400).json({ success: false, message: 'Invalid vehicle ID format' });
        } else {
          res.status(500).json({ success: false, message: 'Error deleting vehicle' });
        }
        } else {
          res.status(500).json({ success: false, message: 'Unknown error occurred' });
        }
      }
      break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }
  }
  
  export default corsMiddleware(withRateLimit(withAuth(validateRequest(handler))));