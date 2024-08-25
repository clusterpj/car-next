// File: src/pages/api/rentals/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/db'
import Rental from '@/models/Rental'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect()

  switch (req.method) {
    case 'GET':
      try {
        const rentals = await Rental.find({}).populate('user vehicle')
        res.status(200).json(rentals)
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        const rental = await Rental.create(req.body)
        res.status(201).json(rental)
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}
