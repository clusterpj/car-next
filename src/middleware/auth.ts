// File: src/middleware/auth.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'

export function withAuth(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = await getToken({ req })

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    if (token.role !== 'admin') {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden: Admin access required' })
    }

    return handler(req, res)
  }
}
