import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import validator from 'validator'

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'customer' | 'manager';
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin: Date;
  passwordResetToken: string;
  passwordResetExpires: Date;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  oauthProvider?: string;
  oauthId?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): Promise<string>;
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address']
  },
  password: { 
    type: String, 
    required: true,
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't return password on queries
  },
  role: { type: String, enum: ['admin', 'customer', 'manager'], default: 'customer' },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },
  passwordResetToken: String,
  passwordResetExpires: Date,
  phoneNumber: { type: String, validate: [validator.isMobilePhone, 'Please provide a valid phone number'] },
  address: String,
  avatarUrl: String,
  oauthProvider: String,
  oauthId: String
}, {
  timestamps: true // Adds createdAt and updatedAt fields
})

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12)
  }
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.generatePasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000 // Token expires in 10 minutes
  await this.save()
  return resetToken
}

userSchema.index({ email: 1, oauthProvider: 1, oauthId: 1 })

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema)