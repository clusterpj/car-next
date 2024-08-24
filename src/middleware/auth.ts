// File: src/middleware/auth.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

export function withAuth(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req })

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    // TODO: Implement role-based access control if needed

    return handler(req, res)
  }
}