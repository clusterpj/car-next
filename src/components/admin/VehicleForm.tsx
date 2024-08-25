// File: src/components/admin/VehicleForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { IVehicle, IVehicleProps } from '@/models/Vehicle';
import { createVehicle, updateVehicle } from '@/lib/api';

const schema = yup.object({
  make: yup.string().required('Make is required'),
  modelName: yup.string().required('Model name is required'),
  year: yup.number().required('Year is required').min(1900).max(new Date().getFullYear() + 1),
  licensePlate: yup.string().required('License plate is required'),
  vin: yup.string().required('VIN is required'),
  color: yup.string().required('Color is required'),
  mileage: yup.number().required('Mileage is required').min(0),
  fuelType: yup.string().required('Fuel type is required').oneOf(['gasoline', 'diesel', 'electric', 'hybrid']),
  transmission: yup.string().required('Transmission is required').oneOf(['automatic', 'manual']),
  category: yup.string().required('Category is required').oneOf(['economy', 'midsize', 'luxury', 'suv', 'van']),
  dailyRate: yup.number().required('Daily rate is required').min(0),
  isAvailable: yup.boolean(),
});

type VehicleFormData = yup.InferType<typeof schema>;

interface VehicleFormProps {
  vehicle?: IVehicle | null;
  onSubmit: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<VehicleFormData>({
    resolver: yupResolver(schema),
    defaultValues: vehicle ? {
      ...vehicle,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      category: vehicle.category,
    } : {},
  });

  const onSubmitForm = async (data: VehicleFormData) => {
    try {
      if (vehicle) {
        await updateVehicle(vehicle._id.toString(), data as IVehicleProps);
      } else {
        await createVehicle(data as IVehicleProps);
      }
      onSubmit();
    } catch (error) {
      console.error('Failed to save vehicle', error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <Input {...register('make')} placeholder="Make" />
      {errors.make && <p className="text-red-500">{errors.make.message}</p>}

      <Input {...register('modelName')} placeholder="Model" />
      {errors.modelName && <p className="text-red-500">{errors.modelName.message}</p>}

      <Input {...register('year')} type="number" placeholder="Year" />
      {errors.year && <p className="text-red-500">{errors.year.message}</p>}

      <Input {...register('licensePlate')} placeholder="License Plate" />
      {errors.licensePlate && <p className="text-red-500">{errors.licensePlate.message}</p>}

      <Input {...register('vin')} placeholder="VIN" />
      {errors.vin && <p className="text-red-500">{errors.vin.message}</p>}

      <Input {...register('color')} placeholder="Color" />
      {errors.color && <p className="text-red-500">{errors.color.message}</p>}

      <Input {...register('mileage')} type="number" placeholder="Mileage" />
      {errors.mileage && <p className="text-red-500">{errors.mileage.message}</p>}

      <Select {...register('fuelType')}>
        <option value="">Select Fuel Type</option>
        <option value="gasoline">Gasoline</option>
        <option value="diesel">Diesel</option>
        <option value="electric">Electric</option>
        <option value="hybrid">Hybrid</option>
      </Select>
      {errors.fuelType && <p className="text-red-500">{errors.fuelType.message}</p>}

      <Select {...register('transmission')}>
        <option value="">Select Transmission</option>
        <option value="automatic">Automatic</option>
        <option value="manual">Manual</option>
      </Select>
      {errors.transmission && <p className="text-red-500">{errors.transmission.message}</p>}

      <Select {...register('category')}>
        <option value="">Select Category</option>
        <option value="economy">Economy</option>
        <option value="midsize">Midsize</option>
        <option value="luxury">Luxury</option>
        <option value="suv">SUV</option>
        <option value="van">Van</option>
      </Select>
      {errors.category && <p className="text-red-500">{errors.category.message}</p>}

      <Input {...register('dailyRate')} type="number" step="0.01" placeholder="Daily Rate" />
      {errors.dailyRate && <p className="text-red-500">{errors.dailyRate.message}</p>}

      <div className="flex items-center space-x-2">
        <Checkbox {...register('isAvailable')} id="isAvailable" />
        <label htmlFor="isAvailable">Is Available</label>
      </div>

      <Button type="submit">{vehicle ? 'Update Vehicle' : 'Create Vehicle'}</Button>
    </form>
  );
};

export default VehicleForm;