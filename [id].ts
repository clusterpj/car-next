import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
import Rental, { IRental } from '@/models/Rental';
import { IUser } from '@/models/User';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { validateRequest } from '@/middleware/validateRequest';
import { createLogger } from '@/utils/logger';
import { corsMiddleware } from '@/middleware/cors';
import { sanitizeInput, SanitizedInput } from '@/utils/sanitizer';
import { MongoError } from 'mongodb';
import mongoose from 'mongoose';

const logger = createLogger('rentals-api');

class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, message: 'Rental ID is required' });
  }

  await dbConnect();

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, id);
      case 'PUT':
        return await handlePut(req, res, id);
      case 'DELETE':
        return await handleDelete(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    return handleError(error, res);
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
  const session = await getSession({ req });
  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }

  const rental = await Rental.findById(id)
    .populate<{ user: IUser }>('user', 'name email')
    .populate('vehicle', 'make modelName year');

  if (!rental) {
    throw new ApiError(404, 'Rental not found');
  }

  // Check if the user is authorized to view this rental
  const isAdmin = session.user.role === 'admin';
  const isOwner = rental.user._id.toString() === session.user.id;

  if (!isAdmin && !isOwner) {
    throw new ApiError(403, 'Forbidden');
  }

  // Prepare the rental data to be returned
  const rentalData = {
    _id: rental._id,
    user: {
      name: rental.user.name,
      email: rental.user.email
    },
    vehicle: {
      make: rental.vehicle.make,
      modelName: rental.vehicle.modelName,
      year: rental.vehicle.year
    },
    startDate: rental.startDate,
    endDate: rental.endDate,
    totalCost: rental.totalCost,
    status: rental.status,
    pickupLocation: rental.pickupLocation,
    dropoffLocation: rental.dropoffLocation,
    additionalDrivers: rental.additionalDrivers,
    insuranceOption: rental.insuranceOption,
    paymentMethod: rental.paymentMethod,
    paymentStatus: rental.paymentStatus
  };

  return res.status(200).json({ success: true, data: rentalData });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, id: string) {
  const session = await getSession({ req });
  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }

  const rental = await Rental.findById(id);
  if (!rental) {
    throw new ApiError(404, 'Rental not found');
  }

  if (session.user.role !== 'admin' && rental.user.toString() !== session.user.id) {
    throw new ApiError(403, 'Forbidden');
  }

  const sanitizedBody = sanitizeInput(req.body);
  if (sanitizedBody === null) {
    throw new ApiError(400, 'Invalid input');
  }

  const allowedUpdates = ['status', 'additionalDrivers', 'insuranceOption'];
  const updates = Object.keys(sanitizedBody as Record<string, SanitizedInput>)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = (sanitizedBody as Record<string, SanitizedInput>)[key];
      return obj;
    }, {} as Record<string, SanitizedInput>);

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No valid updates provided');
  }

  if (updates.status === 'cancelled') {
    await rental.cancel();
  } else if (updates.status === 'completed') {
    await rental.complete();
  } else {
    Object.assign(rental, updates);
    await rental.save();
  }

  await rental.populate('user', 'name email');
  await rental.populate('vehicle', 'make modelName year');

  logger.info(`Rental updated: ${rental._id}`);
  return res.status(200).json({ success: true, data: rental });
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
  const session = await getSession({ req });
  if (!session || session.user.role !== 'admin') {
    throw new ApiError(403, 'Forbidden. Only admins can delete rentals');
  }

  const rental = await Rental.findByIdAndDelete(id);

  if (!rental) {
    throw new ApiError(404, 'Rental not found');
  }

  logger.info(`Rental deleted: ${id}`);
  return res.status(200).json({ success: true, message: 'Rental deleted successfully' });
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