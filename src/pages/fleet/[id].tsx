import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { IVehicle } from '@/models/Vehicle';
import { fetchVehicleById } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

const VehicleDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [vehicle, setVehicle] = useState<IVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleBookNow = () => {
    if (vehicle) {
      const queryParams = new URLSearchParams({
        vehicleId: vehicle._id.toString(),
        make: vehicle.make,
        model: vehicle.modelName,
        dailyRate: vehicle.dailyRate.toString(),
      }).toString();
      router.push(`/customer/booking?${queryParams}`);
    }
  };

  useEffect(() => {
    const loadVehicle = async () => {
      if (typeof id !== 'string') return;
      try {
        const data = await fetchVehicleById(id);
        setVehicle(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load vehicle details. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      loadVehicle();
    }
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!vehicle) return <div className="text-center py-10">Vehicle not found.</div>;

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === vehicle.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? vehicle.images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{vehicle.make} {vehicle.modelName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Dialog>
                <DialogTrigger asChild>
                  <div className="cursor-pointer">
                    <Image
                      src={vehicle.primaryImage}
                      alt={`${vehicle.make} ${vehicle.modelName}`}
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover rounded"
                    />
                    <p className="text-sm text-center mt-2">Click to view gallery</p>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <div className="relative">
                    <Image
                      src={vehicle.images[currentImageIndex]}
                      alt={`${vehicle.make} ${vehicle.modelName}`}
                      width={800}
                      height={600}
                      className="w-full h-auto object-cover"
                    />
                    <Button 
                      className="absolute left-2 top-1/2 transform -translate-y-1/2"
                      onClick={prevImage}
                    >
                      Prev
                    </Button>
                    <Button 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={nextImage}
                    >
                      Next
                    </Button>
                  </div>
                  <div className="flex justify-center mt-4">
                    {vehicle.images.map((image, index) => (
                      <div
                        key={index}
                        className={`w-16 h-16 mx-1 cursor-pointer ${
                          index === currentImageIndex ? 'border-2 border-blue-500' : ''
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <Image
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div>
              <p><strong>Year:</strong> {vehicle.year}</p>
              <p><strong>Category:</strong> {vehicle.category}</p>
              <p><strong>Daily Rate:</strong> ${vehicle.dailyRate.toFixed(2)}</p>
              <p><strong>Transmission:</strong> {vehicle.transmission}</p>
              <p><strong>Fuel Type:</strong> {vehicle.fuelType}</p>
              <p><strong>Features:</strong> {vehicle.features.join(', ')}</p>
              <div className="mt-6">
              <Button className="w-full" onClick={handleBookNow}>Book Now</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleDetail;