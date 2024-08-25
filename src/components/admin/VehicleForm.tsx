import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { IVehicle, IVehicleProps } from '@/models/Vehicle';
import { createVehicle, updateVehicle } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/components/ui/use-toast';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, control, formState: { errors } } = useForm<VehicleFormData>({
    resolver: yupResolver(schema),
    defaultValues: vehicle ? {
      ...vehicle,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      category: vehicle.category,
    } : {},
  });

  const onSubmitForm = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    try {
      if (vehicle) {
        await updateVehicle(vehicle._id.toString(), data as IVehicleProps);
        toast({
          title: "Vehicle Updated",
          description: "The vehicle has been successfully updated.",
        });
      } else {
        await createVehicle(data as IVehicleProps);
        toast({
          title: "Vehicle Created",
          description: "A new vehicle has been successfully created.",
        });
      }
      onSubmit();
    } catch (error) {
      console.error('Failed to save vehicle', error);
      toast({
        title: "Error",
        description: "Failed to save the vehicle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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

      <Controller
        name="fuelType"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select Fuel Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gasoline">Gasoline</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {errors.fuelType && <p className="text-red-500">{errors.fuelType.message}</p>}

      <Controller
        name="transmission"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select Transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">Automatic</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {errors.transmission && <p className="text-red-500">{errors.transmission.message}</p>}

      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="midsize">Midsize</SelectItem>
              <SelectItem value="luxury">Luxury</SelectItem>
              <SelectItem value="suv">SUV</SelectItem>
              <SelectItem value="van">Van</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {errors.category && <p className="text-red-500">{errors.category.message}</p>}

      <Input {...register('dailyRate')} type="number" step="0.01" placeholder="Daily Rate" />
      {errors.dailyRate && <p className="text-red-500">{errors.dailyRate.message}</p>}

      <div className="flex items-center space-x-2">
        <Checkbox {...register('isAvailable')} id="isAvailable" />
        <label htmlFor="isAvailable">Is Available</label>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : (vehicle ? 'Update Vehicle' : 'Create Vehicle')}
      </Button>
    </form>
  );
};

export default VehicleForm;