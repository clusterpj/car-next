// File: src/models/Vehicle.ts
import mongoose, { Document, Model, Schema } from 'mongoose'

// Separate interface for vehicle properties
export interface IVehicleProps {
  make: string
  modelName: string
  year: number
  licensePlate: string
  vin: string
  color: string
  mileage: number
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
  transmission: 'automatic' | 'manual'
  category: 'economy' | 'midsize' | 'luxury' | 'suv' | 'van'
  dailyRate: number
  isAvailable: boolean
  features: string[]
  maintenanceHistory: {
    date: Date
    description: string
    cost: number
  }[]
  images: string[]
  primaryImage: string;
  lastServiced: Date
  nextServiceDue: Date
}

// Extend Document with our properties
export interface IVehicle extends IVehicleProps, Document {
  needsService(): boolean
  age: number
  _id: mongoose.Types.ObjectId
}

// Define a type for the static methods
interface IVehicleModel extends Model<IVehicle> {
  findAvailableByCategory(category: string): Promise<IVehicle[]>
}

const vehicleSchema = new Schema<IVehicle>(
  {
    make: { type: String, required: true, trim: true },
    modelName: { type: String, required: true, trim: true },
    year: {
      type: Number,
      required: true,
      min: [1900, 'Year must be 1900 or later'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
    },
    licensePlate: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[A-Z0-9]{5,8}$/.test(v)
        },
        message: (props: any) =>
          `${props.value} is not a valid license plate number!`,
      },
    },
    vin: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[A-HJ-NPR-Z0-9]{17}$/.test(v)
        },
        message: (props: any) => `${props.value} is not a valid VIN!`,
      },
    },
    color: { type: String, required: true, trim: true },
    mileage: { type: Number, required: true, min: 0 },
    fuelType: {
      type: String,
      required: true,
      enum: ['gasoline', 'diesel', 'electric', 'hybrid'],
    },
    transmission: {
      type: String,
      required: true,
      enum: ['automatic', 'manual'],
    },
    category: {
      type: String,
      required: true,
      enum: ['economy', 'midsize', 'luxury', 'suv', 'van'],
    },
    dailyRate: {
      type: Number,
      required: true,
      min: [0, 'Daily rate cannot be negative'],
    },
    isAvailable: { type: Boolean, default: true },
    features: [{ type: String, trim: true }],
    maintenanceHistory: [
      {
        date: { type: Date, required: true },
        description: { type: String, required: true, trim: true },
        cost: { type: Number, required: true, min: 0 },
      },
    ],
    images: [{ type: String, trim: true }],
    primaryImage: { type: String, trim: true },
    lastServiced: { type: Date },
    nextServiceDue: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Add a method to set the primary image
vehicleSchema.methods.setPrimaryImage = function(imageUrl: string) {
  if (this.images.includes(imageUrl)) {
    this.primaryImage = imageUrl;
  } else {
    throw new Error('Image not found in vehicle images');
  }
};

vehicleSchema.index({ make: 1, modelName: 1 })
vehicleSchema.index({ category: 1, isAvailable: 1 })
vehicleSchema.index({ dailyRate: 1 })

vehicleSchema.virtual('age').get(function (this: IVehicle) {
  return new Date().getFullYear() - this.year
})

vehicleSchema.methods.needsService = function (this: IVehicle): boolean {
  if (!this.nextServiceDue) return false
  return new Date() >= this.nextServiceDue
}

vehicleSchema.statics.findAvailableByCategory = function (category: string) {
  return this.find({ category, isAvailable: true })
}

vehicleSchema.pre('save', function (next) {
  if (this.isModified('lastServiced')) {
    this.nextServiceDue = new Date(
      this.lastServiced.getTime() + 90 * 24 * 60 * 60 * 1000
    )
  }
  next()
})

// Check if the model already exists before compiling it
const Vehicle: IVehicleModel =
  (mongoose.models.Vehicle as IVehicleModel) ||
  mongoose.model<IVehicle, IVehicleModel>('Vehicle', vehicleSchema)

export default Vehicle
