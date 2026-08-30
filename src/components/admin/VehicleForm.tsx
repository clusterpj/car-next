// src/components/admin/VehicleForm.tsx
import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { IVehicle, IVehicleProps } from '@/models/Vehicle';
import { createVehicle, updateVehicle, uploadImages } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/components/ui/use-toast';
import { useDropzone } from 'react-dropzone';

const schema = yup.object({
  make: yup.string().required('Make is required'),
  modelName: yup.string().required('Model name is required'),
  year: yup
    .number()
    .required('Year is required')
    .min(1900)
    .max(new Date().getFullYear() + 1),
  licensePlate: yup.string().required('License plate is required'),
  vin: yup.string().required('VIN is required'),
  color: yup.string().required('Color is required'),
  mileage: yup.number().required('Mileage is required').min(0),
  fuelType: yup
    .string()
    .required('Fuel type is required')
    .oneOf(['gasoline', 'diesel', 'electric', 'hybrid']),
  transmission: yup
    .string()
    .required('Transmission is required')
    .oneOf(['automatic', 'manual']),
  category: yup
    .string()
    .required('Category is required')
    .oneOf(['economy', 'midsize', 'luxury', 'suv', 'van']),
  dailyRate: yup.number().required('Daily rate is required').min(0),
  isAvailable: yup.boolean().required('Availability is required'),
  images: yup.array().of(yup.mixed()).max(10, 'Maximum of 10 images allowed'),
}).required();

type VehicleFormData = yup.InferType<typeof schema>

interface VehicleFormProps {
  vehicle?: IVehicle | null
  onSubmit: () => void
}

const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>(vehicle?.images || []);
  const [primaryImage, setPrimaryImage] = useState<string>(vehicle?.primaryImage || '');
  const [newImages, setNewImages] = useState<File[]>([]);

  const { register, handleSubmit, control, formState: { errors }, setValue } = useForm<VehicleFormData>({
    resolver: yupResolver(schema),
    defaultValues: vehicle || {},
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setNewImages(prev => [...prev, ...acceptedFiles]);
    try {
      const urls = await uploadImages(acceptedFiles);
      setUploadedImages(prev => [...prev, ...urls]);
      if (!primaryImage && urls.length > 0) {
        setPrimaryImage(urls[0]);
      }
      setValue('images', [...uploadedImages, ...urls]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    }
  }, [uploadedImages, primaryImage, setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*': []},
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 10,
  });

  const onSubmitForm = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    try {
      const vehicleData: Partial<IVehicle> = {
        ...data,
        images: uploadedImages,
        primaryImage,
        fuelType: data.fuelType as 'gasoline' | 'diesel' | 'electric' | 'hybrid',
        transmission: data.transmission as 'automatic' | 'manual',
        category: data.category as 'economy' | 'midsize' | 'luxury' | 'suv' | 'van',
      };
  
      let result: IVehicle;
      if (vehicle) {
        result = await updateVehicle(vehicle._id.toString(), vehicleData, newImages);
      } else {
        result = await createVehicle(vehicleData, newImages);
      }
  
      toast({
        title: vehicle ? "Vehicle Updated" : "Vehicle Created",
        description: vehicle ? "The vehicle has been successfully updated." : "A new vehicle has been successfully created.",
      });
      onSubmit();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${vehicle ? 'update' : 'create'} the vehicle. ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('Current form errors:', errors)

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <Input {...register('make')} placeholder="Make" />
      {errors.make && <p className="text-red-500">{errors.make.message}</p>}

      <Input {...register('modelName')} placeholder="Model" />
      {errors.modelName && (
        <p className="text-red-500">{errors.modelName.message}</p>
      )}

      <Input {...register('year')} type="number" placeholder="Year" />
      {errors.year && <p className="text-red-500">{errors.year.message}</p>}

      <Input {...register('licensePlate')} placeholder="License Plate" />
      {errors.licensePlate && (
        <p className="text-red-500">{errors.licensePlate.message}</p>
      )}

      <Input {...register('vin')} placeholder="VIN" />
      {errors.vin && <p className="text-red-500">{errors.vin.message}</p>}

      <Input {...register('color')} placeholder="Color" />
      {errors.color && <p className="text-red-500">{errors.color.message}</p>}

      <Input {...register('mileage')} type="number" placeholder="Mileage" />
      {errors.mileage && (
        <p className="text-red-500">{errors.mileage.message}</p>
      )}

      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {uploadedImages.map((image, index) => (
          <div key={image} className="relative">
            <img src={image} alt={`Vehicle ${index}`} className="w-full h-auto" />
            <button
              type="button"
              onClick={() => setPrimaryImage(image)}
              className={`absolute top-0 right-0 p-1 ${primaryImage === image ? 'bg-green-500' : 'bg-gray-500'} text-white rounded-full`}
            >
              Primary
            </button>
          </div>
        ))}
      </div>

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
      {errors.fuelType && (
        <p className="text-red-500">{errors.fuelType.message}</p>
      )}

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
      {errors.transmission && (
        <p className="text-red-500">{errors.transmission.message}</p>
      )}

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
      {errors.category && (
        <p className="text-red-500">{errors.category.message}</p>
      )}

      <Input
        {...register('dailyRate')}
        type="number"
        step="0.01"
        placeholder="Daily Rate"
      />
      {errors.dailyRate && (
        <p className="text-red-500">{errors.dailyRate.message}</p>
      )}

      <div className="flex items-center space-x-2">
        <Controller
          name="isAvailable"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="isAvailable"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <label htmlFor="isAvailable">Is Available</label>
      </div>
      {errors.isAvailable && (
        <p className="text-red-500">{errors.isAvailable.message}</p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        onClick={() => console.log('Submit button clicked')}
      >
        {isSubmitting
          ? 'Saving...'
          : vehicle
            ? 'Update Vehicle'
            : 'Create Vehicle'}
      </Button>
    </form>
  )
}

export default VehicleForm
