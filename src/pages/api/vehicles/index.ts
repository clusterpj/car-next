// File: src/pages/api/vehicles/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/db'
import Vehicle from '@/models/Vehicle'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()

  switch (req.method) {
    case 'GET':
      try {
        const vehicles = await Vehicle.find({})
        res.status(200).json(vehicles)
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        const vehicle = await Vehicle.create(req.body)
        res.status(201).json(vehicle)
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}