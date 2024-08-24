// File: src/types/index.ts
export interface User {
    id: string
    email: string
    name: string
    role: 'admin' | 'customer'
    // TODO: Add more user properties as needed
  }
  
  export interface Car {
    id: string
    make: string
    model: string
    year: number
    dailyRate: number
    available: boolean
    // TODO: Add more car properties as needed
  }
  
  export interface Rental {
    id: string
    carId: string
    userId: string
    startDate: Date
    endDate: Date
    totalCost: number
    status: 'pending' | 'active' | 'completed' | 'cancelled'
    // TODO: Add more rental properties as needed
  }