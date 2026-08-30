import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await dbConnect()
    res.status(200).json({ message: 'Database connected successfully' })
  } catch (error: unknown) {
    console.error('Database connection error:', error)

    if (error instanceof Error) {
      res
        .status(500)
        .json({
          message: 'Failed to connect to database',
          error: error.message,
        })
    } else {
      res
        .status(500)
        .json({
          message: 'Failed to connect to database',
          error: 'An unknown error occurred',
        })
    }
  }
}
