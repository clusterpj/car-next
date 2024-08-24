// File: src/lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export const fetchCars = async () => {
  // TODO: Implement API call to fetch cars
}

export const createBooking = async (bookingData: any) => {
  // TODO: Implement API call to create a booking
}

// TODO: Add more API functions as needed