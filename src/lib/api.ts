import axios, { AxiosError } from 'axios';
import { IVehicle } from '@/models/Vehicle';
import { getSession } from 'next-auth/react';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // This is important for including cookies in the request
});

// Update the interceptor to use the correct session properties
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.user) {
    config.headers['Authorization'] = `Bearer ${session.user.id}`;
  }
  return config;
}, (error: AxiosError) => {
  return Promise.reject(error);
});

export const fetchVehicles = async (): Promise<{ vehicles: IVehicle[] }> => {
  try {
    const response = await api.get<{ vehicles: IVehicle[] }>('/vehicles');
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
};

export const createVehicle = async (vehicleData: Partial<IVehicle>): Promise<IVehicle> => {
  try {
    console.log('Creating vehicle with data:', vehicleData);
    const response = await api.post<IVehicle>('/vehicles', vehicleData);
    console.log('Create vehicle response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating vehicle:', (error as AxiosError).response?.data || (error as Error).message);
    throw error;
  }
};

export const updateVehicle = async (id: string, vehicleData: Partial<IVehicle>): Promise<IVehicle> => {
  try {
    const response = await api.put<IVehicle>(`/vehicles/${id}`, vehicleData);
    return response.data;
  } catch (error) {
    console.error('Error updating vehicle:', (error as AxiosError).response?.data || (error as Error).message);
    throw error;
  }
};

export const deleteVehicle = async (id: string): Promise<void> => {
  try {
    await api.delete(`/vehicles/${id}`);
  } catch (error) {
    console.error('Error deleting vehicle:', (error as AxiosError).response?.data || (error as Error).message);
    throw error;
  }
};