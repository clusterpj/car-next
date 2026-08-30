// File: src/pages/api/rentals/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
import Rental from '@/models/Rental';
import Vehicle from '@/models/Vehicle';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { validateRequest } from '@/middleware/validateRequest';
import { createLogger } from '@/utils/logger';
import { corsMiddleware } from '@/middleware/cors';
import { sanitizeInput } from '@/utils/sanitizer';
import { MongoError } from 'mongodb';
import mongoose from 'mongoose';
import { getToken } from 'next-auth/jwt';

const logger = createLogger('rentals-api');

class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

interface SanitizedRentalInput {
  vehicleId: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  additionalDrivers?: number;
  insuranceOption: string;
  paymentMethod: string;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    return handleError(error, res);
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { page = '1', limit = '10', status } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const query: any = {};
  if (session.user.role !== 'admin') {
    query.user = session.user.id;
  }
  if (status) {
    query.status = status;
  }

  const rentalsPromise = Rental.find(query)
    .skip(skip)
    .limit(parseInt(limit as string))
    .populate('user', 'name email')
    .populate('vehicle', 'make modelName year')
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  const countPromise = Rental.countDocuments(query);

  const [rentals, total] = await Promise.all([rentalsPromise, countPromise]);

  return res.status(200).json({
    success: true,
    data: rentals,
    pagination: {
      currentPage: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
      totalItems: total
    }
  });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req });
  if (!token) {
    throw new ApiError(401, 'Unauthorized');
  }

  const userId = token.sub; // Use the subject claim as the user ID

  const sanitizedBody = sanitizeInput(req.body) as SanitizedRentalInput;
  const {
    vehicleId,
    startDate,
    endDate,
    pickupLocation,
    dropoffLocation,
    additionalDrivers,
    insuranceOption,
    paymentMethod
  } = sanitizedBody;

  // Validate required fields
  if (!vehicleId || !startDate || !endDate || !pickupLocation || !dropoffLocation || !insuranceOption || !paymentMethod) {
    throw new ApiError(400, 'Missing required fields');
  }

  // Validate date range
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start >= end) {
    throw new ApiError(400, 'Invalid date range');
  }

  // Check vehicle availability
  const isAvailable = await Rental.checkVehicleAvailability(
    new mongoose.Types.ObjectId(vehicleId),
    start,
    end
  );

  if (!isAvailable) {
    throw new ApiError(400, 'Vehicle is not available for the selected dates');
  }

  // Calculate total cost
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }

  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
  const totalCost = days * vehicle.dailyRate;

  const newRental = new Rental({
    user: token.sub,
    vehicle: vehicleId,
    startDate: start,
    endDate: end,
    totalCost,
    status: 'pending',
    pickupLocation,
    dropoffLocation,
    additionalDrivers: additionalDrivers || 0,
    insuranceOption,
    paymentMethod,
    paymentStatus: 'pending'
  });

  await newRental.save();
  
  // Populate user and vehicle information
  await newRental.populate('user', 'name email');
  await newRental.populate('vehicle', 'make modelName year');

  logger.info(`New rental created: ${newRental._id}`);
  return res.status(201).json({ success: true, data: newRental });
}

function handleError(error: unknown, res: NextApiResponse) {
  logger.error('API Error:', error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  } else if (error instanceof MongoError) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate key error. This item already exists.' });
    } else {
      return res.status(500).json({ success: false, message: 'Database error occurred' });
    }
  } else if (error instanceof Error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  } else {
    return res.status(500).json({ success: false, message: 'An unknown error occurred' });
  }
}

export default corsMiddleware(withRateLimit(withAuth(validateRequest(handler))));