// File: src/pages/admin/cars.tsx
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IVehicle } from '@/models/Vehicle';
import VehicleForm from '@/components/admin/VehicleForm';
import { fetchVehicles, deleteVehicle } from '@/lib/api';

const AdminCars: React.FC = () => {
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<IVehicle | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'admin')) {
      router.push('/');
    } else if (status === 'authenticated') {
      loadVehicles();
    }
  }, [session, status, router]);

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const data = await fetchVehicles();
      setVehicles(data.vehicles);
    } catch (err) {
      setError('Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(id);
        setVehicles(vehicles.filter(vehicle => vehicle._id.toString() !== id));
      } catch (err) {
        setError('Failed to delete vehicle');
      }
    }
  };

  const handleEdit = (vehicle: IVehicle) => {
    setEditingVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = () => {
    setIsDialogOpen(false);
    setEditingVehicle(null);
    loadVehicles();
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Vehicle Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center">
            <Input
              type="text"
              placeholder="Search vehicles..."
              className="max-w-sm"
              // Implement search functionality
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add New Vehicle</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
                </DialogHeader>
                <VehicleForm
                  vehicle={editingVehicle}
                  onSubmit={handleFormSubmit}
                />
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Make</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle._id.toString()}>
                  <TableCell>{vehicle.make}</TableCell>
                  <TableCell>{vehicle.modelName}</TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{vehicle.category}</TableCell>
                  <TableCell>${vehicle.dailyRate}</TableCell>
                  <TableCell>
                    <Button variant="outline" className="mr-2" onClick={() => handleEdit(vehicle)}>
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(vehicle._id.toString())}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCars;