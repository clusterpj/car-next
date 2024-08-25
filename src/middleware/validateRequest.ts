// File: src/middleware/validateRequest.ts
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { createLogger } from '@/utils/logger'

const logger = createLogger('validate-request-middleware')

export function validateRequest(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST' || req.method === 'PUT') {
      const { make, modelName, year, licensePlate, dailyRate } = req.body
      if (!make || !modelName || !year || !licensePlate || !dailyRate) {
        logger.warn(`Invalid request body: ${JSON.stringify(req.body)}`)
        return res
          .status(400)
          .json({ success: false, message: 'Missing required fields' })
      }
    }

    return handler(req, res)
  }
}
