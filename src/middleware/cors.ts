import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors';

const cors = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  origin: process.env.ALLOWED_ORIGIN, // Set this in your .env file
  optionsSuccessStatus: 200
})

export function corsMiddleware(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise((resolve, reject) => {
      cors(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result)
        }
        return resolve(handler(req, res))
      })
    })
  }
}