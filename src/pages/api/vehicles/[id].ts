// File: pages/api/vehicles/[id].ts:
import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/db'
import Vehicle, { IVehicle } from '@/models/Vehicle'
import { withAuth } from '@/middleware/auth'
import { withRateLimit } from '@/middleware/rateLimit'
import { validateRequest } from '@/middleware/validateRequest'
import { createLogger } from '@/utils/logger'
import { corsMiddleware } from '@/middleware/cors'
import { sanitizeInput } from '@/utils/sanitizer'
import { MongoError } from 'mongodb'
import { UpdateQuery } from 'mongoose'

const logger = createLogger('vehicles-api')

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res
      .status(400)
      .json({ success: false, message: 'Vehicle ID is required' })
  }

  await dbConnect()

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, id)
      case 'PUT':
        return await handlePut(req, res, id)
      case 'DELETE':
        return await handleDelete(req, res, id)
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        return res
          .status(405)
          .json({ success: false, message: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    return handleError(error, res)
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  const vehicle = await Vehicle.findById(id)
  if (!vehicle) {
    return res
      .status(404)
      .json({ success: false, message: 'Vehicle not found' })
  }
  return res.status(200).json(vehicle)
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  const sanitizedBody = sanitizeInput(req.body) as Partial<IVehicle>

  if (!sanitizedBody || Object.keys(sanitizedBody).length === 0) {
    return res.status(400).json({ message: 'No valid fields to update' })
  }

  const updateQuery: UpdateQuery<IVehicle> = { $set: sanitizedBody }

  const updatedVehicle = await Vehicle.findByIdAndUpdate(id, updateQuery, {
    new: true,
    runValidators: true,
  })

  if (!updatedVehicle) {
    return res.status(404).json({ message: 'Vehicle not found' })
  }

  return res.status(200).json(updatedVehicle)
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  const deletedVehicle = await Vehicle.findByIdAndDelete(id)

  if (!deletedVehicle) {
    return res
      .status(404)
      .json({ success: false, message: 'Vehicle not found' })
  }

  logger.info(`Vehicle deleted: ${id}`)
  return res
    .status(200)
    .json({ success: true, message: 'Vehicle deleted successfully' })
}

function handleError(error: unknown, res: NextApiResponse) {
  logger.error('API Error:', error)

  if (error instanceof ApiError) {
    return res
      .status(error.statusCode)
      .json({ success: false, message: error.message })
  } else if (error instanceof MongoError) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Duplicate key error. This item already exists.',
        })
    } else {
      return res
        .status(500)
        .json({ success: false, message: 'Database error occurred' })
    }
  } else if (error instanceof Error) {
    return res
      .status(500)
      .json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      })
  } else {
    return res
      .status(500)
      .json({ success: false, message: 'An unknown error occurred' })
  }
}

export default corsMiddleware(withRateLimit(withAuth(validateRequest(handler))))
