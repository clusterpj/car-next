// src/middleware/auth.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export function withAuth(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = await getToken({ req });

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

   // Allow access to user profile for all authenticated users
   if (req.url?.startsWith('/api/user/profile')) {
     return handler(req, res);
   }

       // Allow access to admin profile only for admin users
       if (req.url?.startsWith('/api/admin/profile')) {
        if (token.role !== 'admin') {
          return res.status(403).json({ success: false, message: "Forbidden: Admin access required" });
        }
        return handler(req, res);
      }

    // Allow POST requests for all authenticated users (admins and customers)
    if (req.method === 'POST') {
      return handler(req, res);
    }

    // For other methods (GET, PUT, DELETE), only allow admins
    if (token.role !== 'admin' && req.method !== 'GET') {
      return res.status(403).json({ success: false, message: "Forbidden: Admin access required" });
    }

    return handler(req, res);
  };
}