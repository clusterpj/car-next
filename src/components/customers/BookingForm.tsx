// src/components/customers/BookingForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { IVehicle } from '@/models/Vehicle';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createRental } from '@/lib/api';

interface BookingFormProps {
  selectedCar: IVehicle;
  startDate: string;
  endDate: string;
}

const schema = yup.object().shape({
  pickupLocation: yup.string().required('Pickup location is required'),
  dropoffLocation: yup.string().required('Drop-off location is required'),
  additionalDrivers: yup.number().min(0, 'Cannot be negative').integer(),
  insuranceOption: yup.string().oneOf(['basic', 'premium', 'full']).required('Insurance option is required'),
  paymentMethod: yup.string().oneOf(['creditCard', 'debitCard', 'paypal']).required('Payment method is required'),
  totalCost: yup.number().default(0),
});

type BookingFormData = yup.InferType<typeof schema>;

const BookingForm: React.FC<BookingFormProps> = ({ selectedCar, startDate, endDate }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<BookingFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      additionalDrivers: 0,
      insuranceOption: 'basic',
      paymentMethod: 'creditCard',
      totalCost: 0,
    },
  });

  useEffect(() => {
    if (startDate && endDate && selectedCar) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const cost = days * selectedCar.dailyRate;
      setValue('totalCost', cost);
    }
  }, [startDate, endDate, selectedCar, setValue]);

  const onSubmit = async (data: BookingFormData) => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to make a booking",
        variant: "destructive",
      });
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const rentalData = {
        ...data,
        vehicleId: selectedCar._id,
        startDate,
        endDate,
      };
      const result = await createRental(rentalData);
      toast({
        title: "Success",
        description: "Your booking has been created successfully!",
      });
      router.push(`/rentals/confirmation/${result.data._id}`);
    } catch (error: unknown) {
      let errorMessage = 'An error occurred while creating the booking';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label>Selected Car</Label>
        <Input type="text" value={`${selectedCar.make} ${selectedCar.modelName}`} disabled />
      </div>

      <div>
        <Label>Start Date</Label>
        <Input type="text" value={startDate} disabled />
      </div>

      <div>
        <Label>End Date</Label>
        <Input type="text" value={endDate} disabled />
      </div>

      <div>
        <Label htmlFor="pickupLocation">Pickup Location</Label>
        <Input id="pickupLocation" {...register('pickupLocation')} />
        {errors.pickupLocation && <p className="text-sm text-red-500 mt-1">{errors.pickupLocation.message}</p>}
      </div>

      <div>
        <Label htmlFor="dropoffLocation">Drop-off Location</Label>
        <Input id="dropoffLocation" {...register('dropoffLocation')} />
        {errors.dropoffLocation && <p className="text-sm text-red-500 mt-1">{errors.dropoffLocation.message}</p>}
      </div>

      <div>
        <Label htmlFor="additionalDrivers">Additional Drivers</Label>
        <Input type="number" id="additionalDrivers" {...register('additionalDrivers')} />
        {errors.additionalDrivers && <p className="text-sm text-red-500 mt-1">{errors.additionalDrivers.message}</p>}
      </div>

      <div>
        <Label htmlFor="insuranceOption">Insurance Option</Label>
        <Controller
          name="insuranceOption"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select insurance option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.insuranceOption && <p className="text-sm text-red-500 mt-1">{errors.insuranceOption.message}</p>}
      </div>

      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Controller
          name="paymentMethod"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="creditCard">Credit Card</SelectItem>
                <SelectItem value="debitCard">Debit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.paymentMethod && <p className="text-sm text-red-500 mt-1">{errors.paymentMethod.message}</p>}
      </div>

      <div>
        <Label>Total Cost</Label>
        <Input type="text" value={`$${watch('totalCost') || 0}`} disabled />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Complete Booking'}
      </Button>
    </form>
  );
};

export default BookingForm;