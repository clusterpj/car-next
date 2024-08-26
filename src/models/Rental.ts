// File: src/models/Rental.ts
import mongoose, { Document, Model, Schema } from 'mongoose';
import { IUser } from './User';
import { IVehicle } from './Vehicle';

export interface IRentalProps {
  user: mongoose.Types.ObjectId | IUser;
  vehicle: mongoose.Types.ObjectId | IVehicle;
  startDate: Date;
  endDate: Date;
  totalCost: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  pickupLocation: string;
  dropoffLocation: string;
  additionalDrivers: number;
  insuranceOption: 'basic' | 'premium' | 'full';
  paymentMethod: 'creditCard' | 'debitCard' | 'paypal';
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

export interface IRental extends IRentalProps, Document {
  duration: number;
  isActive: boolean;
  cancel(): Promise<void>;
  complete(): Promise<void>;
}

// Extend the Mongoose Model interface
interface IRentalModel extends Model<IRental> {
  findActiveRentals(): Promise<IRental[]>;
  findOverdueRentals(): Promise<IRental[]>;
  checkVehicleAvailability(vehicleId: mongoose.Types.ObjectId, startDate: Date, endDate: Date): Promise<boolean>;
}

const rentalSchema = new Schema<IRental>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalCost: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  additionalDrivers: { type: Number, default: 0, min: 0 },
  insuranceOption: { 
    type: String, 
    required: true, 
    enum: ['basic', 'premium', 'full']
  },
  paymentMethod: { 
    type: String, 
    required: true, 
    enum: ['creditCard', 'debitCard', 'paypal']
  },
  paymentStatus: { 
    type: String, 
    required: true, 
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
rentalSchema.index({ user: 1, status: 1 });
rentalSchema.index({ vehicle: 1, startDate: 1, endDate: 1 });
rentalSchema.index({ status: 1, endDate: 1 });

// Virtual properties
rentalSchema.virtual('duration').get(function(this: IRental) {
  return Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / (1000 * 3600 * 24));
});

rentalSchema.virtual('isActive').get(function(this: IRental) {
  return this.status === 'active';
});

// Instance methods
rentalSchema.methods.cancel = async function(this: IRental): Promise<void> {
  if (this.status !== 'pending' && this.status !== 'active') {
    throw new Error('Only pending or active rentals can be cancelled');
  }
  this.status = 'cancelled';
  await this.save();
};

rentalSchema.methods.complete = async function(this: IRental): Promise<void> {
  if (this.status !== 'active') {
    throw new Error('Only active rentals can be completed');
  }
  this.status = 'completed';
  await this.save();
};

// Static methods
rentalSchema.statics.findActiveRentals = function(this: Model<IRental>): Promise<IRental[]> {
  return this.find({ status: 'active' }).populate('user vehicle');
};

rentalSchema.statics.findOverdueRentals = function(this: Model<IRental>): Promise<IRental[]> {
  const now = new Date();
  return this.find({ status: 'active', endDate: { $lt: now } }).populate('user vehicle');
};

rentalSchema.statics.checkVehicleAvailability = async function(
  this: Model<IRental>,
  vehicleId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date
): Promise<boolean> {
  const conflictingRentals = await this.find({
    vehicle: vehicleId,
    status: { $in: ['pending', 'active'] },
    $or: [
      { startDate: { $lt: endDate }, endDate: { $gt: startDate } },
      { startDate: { $gte: startDate, $lt: endDate } },
      { endDate: { $gt: startDate, $lte: endDate } }
    ]
  });

  return conflictingRentals.length === 0;
};

// Pre-save hook
rentalSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('startDate') || this.isModified('endDate')) {
    const isAvailable = await (this.constructor as IRentalModel).checkVehicleAvailability(
      this.vehicle as mongoose.Types.ObjectId,
      this.startDate,
      this.endDate
    );

    if (!isAvailable) {
      next(new Error('Vehicle is not available for the selected dates'));
    }
  }
  next();
});

// Create and export the Rental model
const Rental = (mongoose.models.Rental || mongoose.model<IRental, IRentalModel>('Rental', rentalSchema)) as IRentalModel;

export default Rental;