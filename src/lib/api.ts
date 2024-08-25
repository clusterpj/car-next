// File: src/lib/api.ts
import axios from 'axios';
import { IVehicle } from '@/models/Vehicle';

const api = axios.create({
  baseURL: '/api',
});

export const fetchVehicles = async (): Promise<{ vehicles: IVehicle[] }> => {
  const response = await api.get('/vehicles');
  return response.data;
};

export const createVehicle = async (vehicleData: Partial<IVehicle>) => {
  const response = await api.post('/vehicles', vehicleData);
  return response.data;
};

export const updateVehicle = async (id: string, vehicleData: Partial<IVehicle>) => {
  const response = await api.put(`/vehicles/${id}`, vehicleData);
  return response.data;
};

export const deleteVehicle = async (id: string) => {
  const response = await api.delete(`/vehicles/${id}`);
  return response.data;
};

// Add more API functions as needed