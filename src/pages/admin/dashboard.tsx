import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import axios from 'axios'
import { useTheme } from 'next-themes'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarIcon, CarIcon, CreditCardIcon, UserIcon, BarChart2Icon, SettingsIcon, SunIcon, MoonIcon } from 'lucide-react'
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

interface DashboardData {
  popularVehicles: any[]
  recentRentals: any[]
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
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'admin')) {
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

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Admin Dashboard</h2>
        </div>
        <nav className="mt-6">
          <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-300" onClick={() => router.push('/admin/dashboard')}>
            <BarChart2Icon className="mr-2 h-4 w-4" />
            Overview
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-300" onClick={() => router.push('/admin/cars')}>
            <CarIcon className="mr-2 h-4 w-4" />
            Manage Vehicles
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-300" onClick={() => router.push('/admin/rentals')}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Manage Rentals
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-300" onClick={() => router.push('/admin/users')}>
            <UserIcon className="mr-2 h-4 w-4" />
            Manage Users
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-300" onClick={() => router.push('/admin/settings')}>
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>
        <div className="absolute bottom-4 left-4">
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? <MoonIcon className="h-[1.2rem] w-[1.2rem]" /> : <SunIcon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">Dashboard Overview</h1>
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Total Rentals"
              value={dashboardData.totalRentals}
              change={dashboardData.percentChangeRentals}
              icon={<CarIcon className="h-6 w-6 text-blue-500" />}
            />
            <DashboardCard
              title="Active Rentals"
              value={dashboardData.activeRentals}
              change={dashboardData.percentChangeActiveRentals}
              icon={<CalendarIcon className="h-6 w-6 text-green-500" />}
            />
            <DashboardCard
              title="Total Revenue"
              value={`$${dashboardData.totalRevenue.toLocaleString()}`}
              change={12.5} // Placeholder
              icon={<CreditCardIcon className="h-6 w-6 text-yellow-500" />}
            />
            <DashboardCard
              title="Available Cars"
              value={dashboardData.availableCars}
              change={-3} // Placeholder
              icon={<CarIcon className="h-6 w-6 text-purple-500" />}
            />
          </div>

          {/* Tabs for different data views */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rentals">Recent Rentals</TabsTrigger>
              <TabsTrigger value="popular">Popular Vehicles</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Rental Overview</CardTitle>
                  <CardDescription>Summary of rental activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Add a chart or summary here */}
                  <p>Rental activity summary goes here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rentals">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Rentals</CardTitle>
                  <CardDescription>Latest rental activities</CardDescription>
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
                      {dashboardData.recentRentals.map((rental: any) => (
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
            </TabsContent>

            <TabsContent value="popular">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Vehicles</CardTitle>
                  <CardDescription>Most frequently rented vehicles</CardDescription>
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
        </div>
      </main>
    </div>
  )
}

interface DashboardCardProps {
  title: string
  value: number | string
  change: number
  icon: React.ReactNode
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, change, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">
        {change > 0 ? '+' : ''}{change.toFixed(1)}% from last period
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