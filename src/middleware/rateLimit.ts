import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import rateLimit from 'express-rate-limit'
import { createLogger } from '@/utils/logger'

const logger = createLogger('rate-limit-middleware')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' },
  onLimitReached: (req, res, options) => {
    logger.warn(`Rate limit reached for IP: ${req.ip}`)
  }
})

export function withRateLimit(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise((resolve, reject) => {
      limiter(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result)
        }
        return resolve(handler(req, res))
      })
    })
  }
}