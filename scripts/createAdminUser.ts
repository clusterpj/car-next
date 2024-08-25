// scripts/createAdminUser.ts

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Use the existing User model if available
let User: mongoose.Model<IUser>

interface IUser extends mongoose.Document {
  name: string
  email: string
  password: string
  role: 'admin' | 'customer'
  createdAt: Date
}

async function dbConnect(): Promise<void> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error(
      'Please define the MONGODB_URI environment variable in .env.local'
    )
  }

  try {
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    process.exit(1)
  }
}

async function createAdminUser(): Promise<void> {
  await dbConnect()

  try {
    // Try to use existing User model, if not available, create a new one
    try {
      User = mongoose.model<IUser>('User')
    } catch {
      const userSchema = new mongoose.Schema<IUser>({
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
          type: String,
          enum: ['admin', 'customer'],
          default: 'customer',
        },
        createdAt: { type: Date, default: Date.now },
      })

      userSchema.pre(
        'save',
        async function (this: IUser, next: (err?: Error) => void) {
          if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 10)
          }
          next()
        }
      )

      User = mongoose.model<IUser>('User', userSchema)
    }

    const existingAdmin = await User.findOne({ role: 'admin' })
    if (existingAdmin) {
      console.log('An admin user already exists.')
      return
    }

    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'adminpassword123',
      role: 'admin',
    })

    await adminUser.save()
    console.log('Admin user created successfully')
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await mongoose.disconnect()
  }
}

createAdminUser()
