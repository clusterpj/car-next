// File: src/pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import { createLogger } from '@/utils/logger'

const logger = createLogger('register-api')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await dbConnect()

  const { name, email, password } = req.body

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    // Create new user
    const user = new User({ name, email, password })
    await user.save()

    logger.info(`New user registered: ${email}`)
    res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    logger.error('Error registering user:', error)
    res.status(500).json({ message: 'Error registering user' })
  }
}