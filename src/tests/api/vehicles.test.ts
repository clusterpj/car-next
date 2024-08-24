import { NextApiRequest, NextApiResponse } from 'next';
import httpMocks from 'node-mocks-http';
import handler from '@/pages/api/vehicles';
import dbConnect from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import { getSession } from 'next-auth/react';

// Mock external dependencies
jest.mock('@/lib/db');
jest.mock('next-auth/react');
jest.mock('@/models/Vehicle');

describe('Vehicle API', () => {
  let req: NextApiRequest;
  let res: httpMocks.MockResponse<NextApiResponse>;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('GET /api/vehicles', () => {
    it('should return a list of vehicles', async () => {
      const mockVehicles = [
        { _id: '1', make: 'Toyota', model: 'Camry', year: 2021, licensePlate: 'ABC123', dailyRate: 50 },
        { _id: '2', make: 'Honda', model: 'Civic', year: 2020, licensePlate: 'XYZ789', dailyRate: 45 },
      ];
      jest.mocked(Vehicle.find).mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockVehicles),
      } as any);
      jest.mocked(Vehicle.countDocuments).mockResolvedValue(2);

      req.method = 'GET';
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        vehicles: mockVehicles,
        totalPages: 1,
        currentPage: 1,
        totalVehicles: 2,
      });
    });

    it('should handle filtering and pagination', async () => {
      req.method = 'GET';
      req.query = { page: '2', limit: '1', make: 'Toyota', minDailyRate: '40', maxDailyRate: '60' };

      const mockVehicles = [{ _id: '1', make: 'Toyota', model: 'Camry', year: 2021, licensePlate: 'ABC123', dailyRate: 50 }];
      jest.mocked(Vehicle.find).mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockVehicles),
      } as any);
      jest.mocked(Vehicle.countDocuments).mockResolvedValue(2);

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        vehicles: mockVehicles,
        totalPages: 2,
        currentPage: 2,
        totalVehicles: 2,
      });
      expect(Vehicle.find).toHaveBeenCalledWith(expect.objectContaining({
        make: expect.any(RegExp),
        dailyRate: { $gte: 40, $lte: 60 },
      }));
    });
  });

  describe('POST /api/vehicles', () => {
    it('should create a new vehicle when authenticated as admin', async () => {
      jest.mocked(getSession).mockResolvedValue({ user: { role: 'admin' } } as any);
      req.method = 'POST';
      req.body = {
        make: 'Tesla',
        model: 'Model 3',
        year: 2022,
        licensePlate: 'EV123',
        dailyRate: 75,
      };

      const mockCreatedVehicle = { _id: '3', ...req.body };
      jest.mocked(Vehicle.create).mockResolvedValue(mockCreatedVehicle as any);

      await handler(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual(mockCreatedVehicle);
    });

    it('should return 403 when not authenticated as admin', async () => {
      jest.mocked(getSession).mockResolvedValue({ user: { role: 'customer' } } as any);
      req.method = 'POST';

      await handler(req, res);

      expect(res.statusCode).toBe(403);
    });

    it('should return 400 for invalid input', async () => {
      jest.mocked(getSession).mockResolvedValue({ user: { role: 'admin' } } as any);
      req.method = 'POST';
      req.body = { make: 'Tesla' }; // Missing required fields

      await handler(req, res);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/vehicles', () => {
    it('should update an existing vehicle when authenticated as admin', async () => {
      jest.mocked(getSession).mockResolvedValue({ user: { role: 'admin' } } as any);
      req.method = 'PUT';
      req.query = { id: '1' };
      req.body = {
        make: 'Updated Make',
        model: 'Updated Model',
        year: 2023,
        licensePlate: 'UPD123',
        dailyRate: 80,
      };

      const mockUpdatedVehicle = { _id: '1', ...req.body };
      jest.mocked(Vehicle.findByIdAndUpdate).mockResolvedValue(mockUpdatedVehicle as any);

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockUpdatedVehicle);
    });

    it('should return 404 when updating non-existent vehicle', async () => {
      jest.mocked(getSession).mockResolvedValue({ user: { role: 'admin' } } as any);
      req.method = 'PUT';
      req.query = { id: 'nonexistent' };
      req.body = { make: 'Updated Make' };

      jest.mocked(Vehicle.findByIdAndUpdate).mockResolvedValue(null);

      await handler(req, res);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/vehicles', () => {
    it('should delete an existing vehicle when authenticated as admin', async () => {
      jest.mocked(getSession).mockResolvedValue({ user: { role: 'admin' } } as any);
      req.method = 'DELETE';
      req.query = { id: '1' };

      jest.mocked(Vehicle.findByIdAndDelete).mockResolvedValue({ _id: '1' } as any);

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ success: true, message: 'Vehicle deleted successfully' });
    });

    it('should return 404 when deleting non-existent vehicle', async () => {
      jest.mocked(getSession).mockResolvedValue({ user: { role: 'admin' } } as any);
      req.method = 'DELETE';
      req.query = { id: 'nonexistent' };

      jest.mocked(Vehicle.findByIdAndDelete).mockResolvedValue(null);

      await handler(req, res);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors', async () => {
      req.method = 'GET';
      jest.mocked(Vehicle.find).mockRejectedValue(new Error('Database error'));

      await handler(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ success: false, message: 'Error fetching vehicles' });
    });

    it('should return 405 for unsupported methods', async () => {
      req.method = 'PATCH';

      await handler(req, res);

      expect(res.statusCode).toBe(405);
    });
  });
});