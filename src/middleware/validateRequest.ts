// File: src/middleware/validateRequest.ts
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { createLogger } from '@/utils/logger'
import * as yup from 'yup'

const logger = createLogger('validate-request-middleware')

const rentalSchema = yup.object().shape({
  vehicleId: yup.string().required('Vehicle ID is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().min(yup.ref('startDate'), 'End date must be after start date').required('End date is required'),
  pickupLocation: yup.string().required('Pickup location is required'),
  dropoffLocation: yup.string().required('Drop-off location is required'),
  additionalDrivers: yup.number().min(0, 'Cannot be negative').integer(),
  insuranceOption: yup.string().oneOf(['basic', 'premium', 'full']).required('Insurance option is required'),
  paymentMethod: yup.string().oneOf(['creditCard', 'debitCard', 'paypal']).required('Payment method is required'),
  totalCost: yup.number().min(0, 'Total cost must be non-negative').required('Total cost is required'),
});

export function validateRequest(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST' && req.url?.includes('/api/rentals')) {
      try {
        await rentalSchema.validate(req.body, { abortEarly: false });
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          logger.warn(`Invalid request body: ${JSON.stringify(req.body)}`);
          return res.status(400).json({ success: false, errors: error.errors });
        }
      }
    }

    return handler(req, res);
  }
}