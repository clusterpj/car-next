import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import dbConnect from '@/lib/db'
import Rental from '@/models/Rental'
import Vehicle from '@/models/Vehicle'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' })
  }

  await dbConnect()

  try {
    const [
      totalRentals, 
      activeRentals, 
      totalRevenue, 
      availableCars,
      recentRentals,
      popularVehicles
    ] = await Promise.all([
      Rental.countDocuments(),
      Rental.countDocuments({ status: 'active' }),
      Rental.aggregate([
        { $group: { _id: null, total: { $sum: '$totalCost' } } }
      ]),
      Vehicle.countDocuments({ isAvailable: true }),
      Rental.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .populate('vehicle', 'make modelName')
        .lean(),
      Rental.aggregate([
        { $group: { _id: '$vehicle', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'vehicles',
            localField: '_id',
            foreignField: '_id',
            as: 'vehicleDetails'
          }
        },
        { $unwind: '$vehicleDetails' },
        {
          $project: {
            _id: 0,
            vehicle: { $concat: ['$vehicleDetails.make', ' ', '$vehicleDetails.modelName'] },
            count: 1
          }
        }
      ])
    ])

    const lastMonthStart = new Date()
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)
    lastMonthStart.setDate(1)

    const [lastMonthRentals, lastWeekRentals] = await Promise.all([
      Rental.countDocuments({ createdAt: { $gte: lastMonthStart } }),
      Rental.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      })
    ])

    const percentChangeRentals = ((totalRentals - lastMonthRentals) / lastMonthRentals) * 100
    const percentChangeActiveRentals = ((activeRentals - lastWeekRentals) / lastWeekRentals) * 100

    res.status(200).json({
      totalRentals,
      activeRentals,
      totalRevenue: totalRevenue[0]?.total || 0,
      availableCars,
      percentChangeRentals,
      percentChangeActiveRentals,
      recentRentals,
      popularVehicles
    })
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    res.status(500).json({ message: 'Error fetching dashboard data' })
  }
}