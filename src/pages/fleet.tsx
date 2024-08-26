import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IVehicle } from '@/models/Vehicle';
import { fetchVehicles } from '@/lib/api';
import Image from 'next/image';

const Fleet: NextPage = () => {
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await fetchVehicles();
        setVehicles(data.vehicles);
        setLoading(false);
      } catch (err) {
        setError('Failed to load vehicles. Please try again later.');
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  const filteredVehicles = vehicles.filter(vehicle => 
    (vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
     vehicle.modelName.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!categoryFilter || vehicle.category === categoryFilter)
  );

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Fleet</h1>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Input
          type="text"
          placeholder="Search by make or model"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select onValueChange={(value) => setCategoryFilter(value === 'all' ? undefined : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="economy">Economy</SelectItem>
            <SelectItem value="midsize">Midsize</SelectItem>
            <SelectItem value="luxury">Luxury</SelectItem>
            <SelectItem value="suv">SUV</SelectItem>
            <SelectItem value="van">Van</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle._id.toString()} className="flex flex-col">
            <CardHeader>
              <CardTitle>{vehicle.make} {vehicle.modelName}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              {vehicle.primaryImage && (
                <Image
                  src={vehicle.primaryImage}
                  alt={`${vehicle.make} ${vehicle.modelName}`}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover mb-4 rounded"
                />
              )}
              <p><strong>Year:</strong> {vehicle.year}</p>
              <p><strong>Category:</strong> {vehicle.category}</p>
              <p><strong>Daily Rate:</strong> ${vehicle.dailyRate.toFixed(2)}</p>
            </CardContent>
            <CardFooter>
              <Link href={`/fleet/${vehicle._id}`} passHref>
                <Button className="w-full">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Fleet;