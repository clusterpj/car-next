// File: __tests__/api/vehicles.test.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks, RequestMethod, MockResponse } from 'node-mocks-http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import handler from '@/pages/api/vehicles/index';
import Vehicle, { IVehicle } from '@/models/Vehicle';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Vehicle.deleteMany({});
});

// Helper function to create mocks
function createMockRequestResponse(method: RequestMethod, body?: any, query?: any) {
  const { req, res } = createMocks({ method, body, query });
  req.env = {} as any; // Add this line to satisfy the NextApiRequest type
  return { req: req as unknown as NextApiRequest, res: res as unknown as NextApiResponse };
}

describe('Vehicle API', () => {
it('should create a new vehicle', async () => {
  const { req, res } = createMocks<NextApiRequest, MockResponse<any>>({
    method: 'POST' as RequestMethod,
    body: {
      make: 'Toyota',
      modelName: 'Corolla',
      year: 2021,
      licensePlate: 'ABC123',
      vin: '1HGBH41JXMN109186',
      color: 'Red',
      mileage: 1000,
      fuelType: 'gasoline',
      transmission: 'automatic',
      category: 'economy',
      dailyRate: 50,
      isAvailable: true,
      features: ['Air Conditioning', 'Bluetooth'],
      images: ['http://example.com/image.jpg'],
    },
  });

  await handler(req, res as NextApiResponse);

  expect(res._getStatusCode()).toBe(201);
  expect(JSON.parse(res._getData())).toHaveProperty('_id');
});


it('should get a list of vehicles', async () => {
  // Create some test vehicles
  await Vehicle.create([
    { make: 'Toyota', modelName: 'Corolla', year: 2021, licensePlate: 'ABC123', vin: '1HGBH41JXMN109186', color: 'Red', mileage: 1000, fuelType: 'gasoline', transmission: 'automatic', category: 'economy', dailyRate: 50, isAvailable: true },
    { make: 'Honda', modelName: 'Civic', year: 2020, licensePlate: 'DEF456', vin: '2HGBH41JXMN109187', color: 'Blue', mileage: 2000, fuelType: 'hybrid', transmission: 'automatic', category: 'economy', dailyRate: 55, isAvailable: true },
  ]);

  const { req, res } = createMocks<NextApiRequest, MockResponse<any>>({
    method: 'GET' as RequestMethod,
  });

  await handler(req, res as NextApiResponse);

  expect(res._getStatusCode()).toBe(200);
  const data = JSON.parse(res._getData());
  expect(data.vehicles.length).toBe(2);
  expect(data.totalVehicles).toBe(2);
});


it('should update a vehicle', async () => {
  const vehicle = await Vehicle.create({
    make: 'Toyota',
    modelName: 'Corolla',
    year: 2021,
    licensePlate: 'ABC123',
    vin: '1HGBH41JXMN109186',
    color: 'Red',
    mileage: 1000,
    fuelType: 'gasoline',
    transmission: 'automatic',
    category: 'economy',
    dailyRate: 50,
    isAvailable: true
  }) as IVehicle;

  const { req, res } = createMocks<NextApiRequest, MockResponse<any>>({
    method: 'PUT' as RequestMethod,
    query: { id: vehicle._id.toString() },
    body: { color: 'Blue', mileage: 1500 },
  });

  await handler(req, res as NextApiResponse);

  expect(res._getStatusCode()).toBe(200);
  const updatedVehicle = JSON.parse(res._getData());
  expect(updatedVehicle.color).toBe('Blue');
  expect(updatedVehicle.mileage).toBe(1500);
});



it('should delete a vehicle', async () => {
  const vehicle = await Vehicle.create({ make: 'Toyota', modelName: 'Corolla', year: 2021, licensePlate: 'ABC123', vin: '1HGBH41JXMN109186', color: 'Red', mileage: 1000, fuelType: 'gasoline', transmission: 'automatic', category: 'economy', dailyRate: 50, isAvailable: true });

  const { req, res } = createMocks<NextApiRequest, MockResponse<any>>({
    method: 'DELETE' as RequestMethod,
    query: { id: vehicle._id.toString() },
  });

  await handler(req, res as NextApiResponse);

  expect(res._getStatusCode()).toBe(200);
  expect(JSON.parse(res._getData())).toEqual({ success: true, message: 'Vehicle deleted successfully' });

  const deletedVehicle = await Vehicle.findById(vehicle._id);
  expect(deletedVehicle).toBeNull();
});

});

describe('Vehicle Model', () => {
  it('should calculate the age of a vehicle', async () => {
    const currentYear = new Date().getFullYear();
    const vehicle = new Vehicle({ make: 'Toyota', modelName: 'Corolla', year: currentYear - 2, licensePlate: 'ABC123', vin: '1HGBH41JXMN109186', color: 'Red', mileage: 1000, fuelType: 'gasoline', transmission: 'automatic', category: 'economy', dailyRate: 50, isAvailable: true });
    expect(vehicle.age).toBe(2);
  });

  it('should determine if a vehicle needs service', async () => {
    const vehicle = new Vehicle({ make: 'Toyota', modelName: 'Corolla', year: 2021, licensePlate: 'ABC123', vin: '1HGBH41JXMN109186', color: 'Red', mileage: 1000, fuelType: 'gasoline', transmission: 'automatic', category: 'economy', dailyRate: 50, isAvailable: true });
    
    vehicle.lastServiced = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000); // 100 days ago
    await vehicle.save();

    expect(vehicle.needsService()).toBe(true);

    vehicle.lastServiced = new Date(); // Now
    await vehicle.save();

    expect(vehicle.needsService()).toBe(false);
  });

  it('should find available vehicles by category', async () => {
    await Vehicle.create([
      { make: 'Toyota', modelName: 'Corolla', year: 2021, licensePlate: 'ABC123', vin: '1HGBH41JXMN109186', color: 'Red', mileage: 1000, fuelType: 'gasoline', transmission: 'automatic', category: 'economy', dailyRate: 50, isAvailable: true },
      { make: 'Honda', modelName: 'Civic', year: 2020, licensePlate: 'DEF456', vin: '2HGBH41JXMN109187', color: 'Blue', mileage: 2000, fuelType: 'hybrid', transmission: 'automatic', category: 'economy', dailyRate: 55, isAvailable: false },
      { make: 'BMW', modelName: '3 Series', year: 2022, licensePlate: 'GHI789', vin: '3HGBH41JXMN109188', color: 'Black', mileage: 500, fuelType: 'gasoline', transmission: 'automatic', category: 'luxury', dailyRate: 100, isAvailable: true },
    ]);

    const availableEconomyVehicles = await Vehicle.findAvailableByCategory('economy');
    expect(availableEconomyVehicles.length).toBe(1);
    expect(availableEconomyVehicles[0].make).toBe('Toyota');
  });
});