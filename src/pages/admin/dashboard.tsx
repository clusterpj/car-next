import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import axios from 'axios'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarIcon, CarIcon, CreditCardIcon, UserIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

interface RecentRental {
  _id: string
  user: { name: string; email: string }
  vehicle: { make: string; modelName: string }
  startDate: string
  endDate: string
  totalCost: number
}

interface PopularVehicle {
  vehicle: string
  count: number
}

interface ExtendedDashboardData extends DashboardData {
  recentRentals: RecentRental[]
  popularVehicles: PopularVehicle[]
}

interface DashboardData {
  popularVehicles: any[] | undefined
  recentRentals: any
  totalRentals: number
  activeRentals: number
  totalRevenue: number
  availableCars: number
  percentChangeRentals: number
  percentChangeActiveRentals: number
}

const fetchDashboardData = async (): Promise<DashboardData> => {
  const { data } = await axios.get('/api/admin/dashboard')
  return data
}

const AdminDashboard: React.FC = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { data: dashboardData, isLoading, error } = useQuery<DashboardData, Error>('dashboardData', fetchDashboardData)

  // Redirect if not authenticated or not an admin
  React.useEffect(() => {
    if (
      status === 'unauthenticated' ||
      (session && session.user.role !== 'admin')
    ) {
      router.push('/')
    }
  }, [session, status, router])

  if (status === 'loading' || isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return <div>Error loading dashboard data: {error.message}</div>
  }

  if (!session || session.user.role !== 'admin' || !dashboardData) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Rentals"
          value={dashboardData.totalRentals}
          change={dashboardData.percentChangeRentals}
          icon={<CarIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <DashboardCard
          title="Active Rentals"
          value={dashboardData.activeRentals}
          change={dashboardData.percentChangeActiveRentals}
          icon={<CalendarIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <DashboardCard
          title="Total Revenue"
          value={`$${dashboardData.totalRevenue.toLocaleString()}`}
          change={12.5} // This is still a placeholder as we don't calculate it in the API
          icon={<CreditCardIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <DashboardCard
          title="Available Cars"
          value={dashboardData.availableCars}
          change={-3} // This is still a placeholder as we don't calculate it in the API
          icon={<CarIcon className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Rentals</CardTitle>
              <CardDescription>
                Overview of the most recent rental activities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.recentRentals.map((rental: { _id: React.Key | null | undefined; user: { name: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined }; vehicle: { make: any; modelName: any }; startDate: string | number | Date; endDate: string | number | Date; totalCost: number }) => (
                    <TableRow key={rental._id}>
                      <TableCell>{rental.user.name}</TableCell>
                      <TableCell>{`${rental.vehicle.make} ${rental.vehicle.modelName}`}</TableCell>
                      <TableCell>{new Date(rental.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(rental.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>${rental.totalCost.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Popular Vehicles</CardTitle>
              <CardDescription>
                The most frequently rented vehicles this month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.popularVehicles}>
                  <XAxis dataKey="vehicle" />
                  <YAxis />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex space-x-4">
        <Button onClick={() => router.push('/admin/cars')}>
          Manage Vehicles
        </Button>
        <Button onClick={() => router.push('/admin/rentals')}>Manage Rentals</Button>
        <Button>Generate Report</Button>
      </div>
    </div>
  )
}

interface DashboardCardProps {
  title: string;
  value?: number | string | null;
  change?: number | null;
  icon: React.ReactNode;
}


const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, change, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {value !== null && value !== undefined ? value : 'N/A'}
      </div>
      <p className="text-xs text-muted-foreground">
        {change !== null && change !== undefined ? (
          <>
            {change > 0 ? '+' : ''}
            {change.toFixed(1)}% from last period
          </>
        ) : (
          'No change data available'
        )}
      </p>
    </CardContent>
  </Card>
)


const DashboardSkeleton: React.FC = () => (
  <div className="container mx-auto px-4 py-8">
    <Skeleton className="h-10 w-48 mb-8" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

export default AdminDashboard
