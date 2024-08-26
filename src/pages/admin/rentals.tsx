// File: src/pages/admin/rentals.tsx
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { fetchRentals, updateRentalStatus } from '@/lib/api';
import { IRental } from '@/models/Rental';

const AdminRentals: React.FC = () => {
  const [rentals, setRentals] = useState<IRental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const limit = 10; // Number of rentals per page

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'admin')) {
      router.push('/');
    } else if (status === 'authenticated') {
      loadRentals();
    }
  }, [session, status, router, currentPage, statusFilter]);

  const loadRentals = async () => {
    setIsLoading(true);
    try {
      const result = await fetchRentals(currentPage, limit, statusFilter);
      setRentals(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      setError('Failed to load rentals');
      toast({
        title: "Error",
        description: "Failed to load rentals. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (rentalId: string, newStatus: string) => {
    try {
      await updateRentalStatus(rentalId, newStatus);
      toast({
        title: "Success",
        description: `Rental status updated to ${newStatus}`,
      });
      loadRentals(); // Reload rentals to reflect the change
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update rental status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Rental Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center">
            <Input
              type="text"
              placeholder="Search rentals..."
              className="max-w-sm"
              // Implement search functionality
            />
            <Select onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.map((rental) => (
                <TableRow key={rental._id?.toString()}>
                  <TableCell>{rental._id?.toString().slice(-6)}</TableCell>
                  <TableCell>{(rental.user as any).name}</TableCell>
                  <TableCell>{`${(rental.vehicle as any).make} ${(rental.vehicle as any).modelName}`}</TableCell>
                  <TableCell>{new Date(rental.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(rental.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{rental.status}</TableCell>
                  <TableCell>
                    <Select 
                      onValueChange={(value) => handleStatusChange(rental._id?.toString() || '', value)}
                      defaultValue={rental.status}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-center items-center space-x-2 mt-4">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span>{currentPage} of {totalPages}</span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRentals;