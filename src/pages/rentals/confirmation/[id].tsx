import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { fetchRentalDetails } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RentalData {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  vehicle: {
    make: string;
    modelName: string;
    year: number;
  };
  startDate: string;
  endDate: string;
  totalCost: number;
  status: string;
  pickupLocation: string;
  dropoffLocation: string;
  additionalDrivers: number;
  insuranceOption: string;
  paymentMethod: string;
  paymentStatus: string;
}

const RentalConfirmation = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [rental, setRental] = useState<RentalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const { id } = router.query;
    if (id && session) {
      fetchRentalDetails(id as string)
        .then(data => {
          setRental(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching rental details:', err);
          setError('Failed to load rental details. Please try again.');
          setLoading(false);
        });
    }
  }, [router.query, session]);

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!rental) {
    return <div>No rental found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Rental Confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold mb-4">Thank you for your rental!</h2>
          <p className="mb-4">Your rental has been successfully booked. Here are the details:</p>
          <div className="space-y-2">
            <p><strong>Rental ID:</strong> {rental._id}</p>
            <p><strong>Vehicle:</strong> {rental.vehicle.make} {rental.vehicle.modelName} ({rental.vehicle.year})</p>
            <p><strong>Pick-up Date:</strong> {new Date(rental.startDate).toLocaleDateString()}</p>
            <p><strong>Drop-off Date:</strong> {new Date(rental.endDate).toLocaleDateString()}</p>
            <p><strong>Pick-up Location:</strong> {rental.pickupLocation}</p>
            <p><strong>Drop-off Location:</strong> {rental.dropoffLocation}</p>
            <p><strong>Total Cost:</strong> ${rental.totalCost.toFixed(2)}</p>
            <p><strong>Status:</strong> {rental.status}</p>
            <p><strong>Insurance Option:</strong> {rental.insuranceOption}</p>
            <p><strong>Payment Method:</strong> {rental.paymentMethod}</p>
            <p><strong>Payment Status:</strong> {rental.paymentStatus}</p>
          </div>
          <Button className="mt-4" onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RentalConfirmation;