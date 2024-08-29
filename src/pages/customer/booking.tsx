// src/pages/customer/booking.tsx
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import CarSelection from '@/components/customers/CarSelection';
import BookingForm from '@/components/customers/BookingForm';
import { IVehicle } from '@/models/Vehicle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchVehicleById } from '@/lib/api';

const CustomerBooking: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedCar, setSelectedCar] = useState<IVehicle | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    const { vehicleId } = router.query;
    if (vehicleId && typeof vehicleId === 'string') {
      fetchVehicleById(vehicleId).then(vehicle => {
        setSelectedCar(vehicle);
      }).catch(error => {
        console.error('Error fetching vehicle:', error);
      });
    }
  }, [router.query]);

  if (status === 'loading') { 
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Book a Car</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Dates</CardTitle>
          <CardDescription>Choose your rental period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {startDate && endDate && !selectedCar && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select a Vehicle</CardTitle>
            <CardDescription>Choose from our available vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <CarSelection 
              onSelectCar={setSelectedCar} 
              startDate={startDate} 
              endDate={endDate}
            />
          </CardContent>
        </Card>
      )}

      {selectedCar && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Booking</CardTitle>
            <CardDescription>Fill in the details to book your selected vehicle</CardDescription>
          </CardHeader>
          <CardContent>
            <BookingForm 
              selectedCar={selectedCar}
              startDate={startDate}
              endDate={endDate}
            />
          </CardContent>
        </Card>
      )}

      {!selectedCar && startDate && endDate && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-lg mb-4">Please select a vehicle to proceed with your booking.</p>
            <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Choose a Vehicle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerBooking;