// src/pages/api/admin/profile.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { createLogger } from '@/utils/logger';
import { corsMiddleware } from '@/middleware/cors';
import { sanitizeInput } from '@/utils/sanitizer';
import { MongoError } from 'mongodb';

const logger = createLogger('admin-profile-api');

class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'PUT':
        return await handlePut(req, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    return handleError(error, res);
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session || session.user.role !== 'admin') {
    throw new ApiError(403, 'Forbidden: Admin access required');
  }

  const admin = await User.findById(session.user.id).select('-password');
  if (!admin) {
    throw new ApiError(404, 'Admin not found');
  }

  return res.status(200).json({
    success: true,
    data: {
      name: admin.name,
      email: admin.email,
      role: admin.role,
      lastLogin: admin.lastLogin,
      // Add any other admin-specific fields here
    },
  });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session || session.user.role !== 'admin') {
    throw new ApiError(403, 'Forbidden: Admin access required');
  }

  const sanitizedBody = sanitizeInput(req.body);
  if (!sanitizedBody) {
    throw new ApiError(400, 'Invalid input');
  }

  const allowedUpdates = ['name', 'email']; // Limit what an admin can update
  const updates = Object.keys(sanitizedBody)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = sanitizedBody[key];
      return obj;
    }, {} as Record<string, any>);

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No valid updates provided');
  }

  const admin = await User.findByIdAndUpdate(
    session.user.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password');

  if (!admin) {
    throw new ApiError(404, 'Admin not found');
  }

  logger.info(`Admin profile updated: ${admin._id}`);
  return res.status(200).json({
    success: true,
    data: {
      name: admin.name,
      email: admin.email,
      role: admin.role,
      lastLogin: admin.lastLogin,
      // Add any other admin-specific fields here
    },
  });
}

function handleError(error: unknown, res: NextApiResponse) {
  logger.error('API Error:', error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  } else if (error instanceof MongoError) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate key error. This field must be unique.' });
    } else {
      return res.status(500).json({ success: false, message: 'Database error occurred' });
    }
  } else if (error instanceof Error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  } else {
    return res.status(500).json({ success: false, message: 'An unknown error occurred' });
  }
}

export default corsMiddleware(withRateLimit(withAuth(handler)));