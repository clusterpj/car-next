// File: src/models/Vehicle.ts
import mongoose from 'mongoose'

const vehicleSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  licensePlate: { type: String, required: true, unique: true },
  dailyRate: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema)