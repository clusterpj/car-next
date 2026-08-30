import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { createLogger } from '@/utils/logger'

const logger = createLogger('rate-limit-middleware')

export function withRateLimit(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // For now, we'll just log the request and pass it through
    logger.info(`Rate limit check for ${req.method} ${req.url}`)
    return handler(req, res)
  }
}
