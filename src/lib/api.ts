// File: src/lib/api.ts
import axios, { AxiosError } from 'axios'
import { IVehicle } from '@/models/Vehicle'
import { getSession } from 'next-auth/react'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

api.interceptors.request.use(
  async (config) => {
    const session = await getSession()
    if (session?.user) {
      config.headers['Authorization'] = `Bearer ${session.user.id}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

export const fetchVehicles = async (): Promise<{ vehicles: IVehicle[] }> => {
  try {
    const response = await api.get<{ vehicles: IVehicle[] }>('/vehicles')
    return response.data
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    throw error
  }
}

export const createVehicle = async (
  vehicleData: Partial<IVehicle>,
  newImages: File[]
): Promise<IVehicle> => {
  try {
    let imageUrls: string[] = vehicleData.images || [];
    if (newImages.length > 0) {
      const uploadedUrls = await uploadImages(newImages);
      imageUrls = [...imageUrls, ...uploadedUrls];
    }

    const vehicleWithImages = {
      ...vehicleData,
      images: imageUrls,
      primaryImage: vehicleData.primaryImage || imageUrls[0] || '',
    };

    const response = await api.post<IVehicle>('/vehicles', vehicleWithImages);
    return response.data;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
};

export const updateVehicle = async (
  id: string,
  vehicleData: Partial<IVehicle>,
  newImages: File[]
): Promise<IVehicle> => {
  try {
    let imageUrls: string[] = vehicleData.images || [];
    if (newImages.length > 0) {
      const uploadedUrls = await uploadImages(newImages);
      imageUrls = [...imageUrls, ...uploadedUrls];
    }

    const vehicleWithImages = {
      ...vehicleData,
      images: imageUrls,
      primaryImage: vehicleData.primaryImage || imageUrls[0] || '',
    };

    const response = await api.put<IVehicle>(`/vehicles/${id}`, vehicleWithImages);
    return response.data;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

export const deleteVehicle = async (id: string): Promise<void> => {
  try {
    await api.delete(`/vehicles/${id}`)
  } catch (error) {
    console.error(
      'Error deleting vehicle:',
      (error as AxiosError).response?.data || (error as Error).message
    )
    throw error
  }
}


export const fetchAvailableVehicles = async (startDate: string, endDate: string): Promise<IVehicle[]> => {
  try {
    const response = await api.get<{ vehicles: IVehicle[] }>('/vehicles', {
      params: { isAvailable: true, startDate, endDate }
    });
    return response.data.vehicles;
  } catch (error) {
    console.error('Error fetching available vehicles:', error);
    throw error;
  }
};

export const createRental = async (rentalData: any): Promise<any> => {
  try {
    const response = await api.post('/rentals', rentalData);
    return response.data;
  } catch (error) {
    console.error('Error creating rental:', error);
    throw error;
  }
};

export const uploadImages = async (images: File[]): Promise<string[]> => {
  const formData = new FormData();
  images.forEach((image) => {
    formData.append('images', image);
  });

  try {
    const response = await api.post<{ urls: string[] }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.urls;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};