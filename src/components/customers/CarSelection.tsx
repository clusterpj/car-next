// src/components/customers/CarSelection.tsx
import React, { useState, useEffect } from 'react';
import { IVehicle } from '@/models/Vehicle';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { fetchAvailableVehicles } from '@/lib/api';
import NextImage from 'next/image'; // 

interface CarSelectionProps {
    onSelectCar: (car: IVehicle) => void;
    startDate: string;
    endDate: string;
  }

  const CarSelection: React.FC<CarSelectionProps> = ({ onSelectCar, startDate, endDate }) => {
    const [cars, setCars] = useState<IVehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
  
    useEffect(() => {
      const fetchCars = async () => {
        if (!startDate || !endDate) {
          return;
        }
        setLoading(true);
        try {
          const availableCars = await fetchAvailableVehicles(startDate, endDate);
          setCars(availableCars);
        } catch (err) {
          setError('Failed to load vehicles. Please try again later.');
          toast({
            title: "Error",
            description: "Failed to load vehicles. Please try again later.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
  
      fetchCars();
    }, [startDate, endDate, toast]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-4 w-[250px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-[200px] mb-2" />
              <Skeleton className="h-4 w-[150px] mb-2" />
              <Skeleton className="h-4 w-[100px]" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car) => (
        <Card key={car._id.toString()}>
          <CardHeader>
            <CardTitle>{car.make} {car.modelName}</CardTitle>
            <CardDescription>Year: {car.year}</CardDescription>
          </CardHeader>
          <CardContent>
            {car.primaryImage && (
              <NextImage // Use the aliased import
                src={car.primaryImage}
                alt={`${car.make} ${car.modelName}`}
                width={300}
                height={200}
                className="w-full h-auto object-cover mb-4"
              />
            )}
            <p><strong>Category:</strong> {car.category}</p>
            <p><strong>Fuel Type:</strong> {car.fuelType}</p>
            <p><strong>Daily Rate:</strong> ${car.dailyRate.toFixed(2)}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => onSelectCar(car)} className="w-full">
              Select This Vehicle
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
export default CarSelection;