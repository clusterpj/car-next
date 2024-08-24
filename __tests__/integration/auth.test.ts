// File: src/__tests__/integration/auth.test.ts
import mongoose from 'mongoose';
import User from '@/models/User';
import { AuthOptions } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import dbConnect from '@/lib/db';
import { CredentialsConfig } from "next-auth/providers/credentials";

// Helper function to get the authorize function from authOptions
function getAuthorizeFunction(options: AuthOptions): CredentialsConfig['authorize'] {
  const provider = options.providers.find(
    (p): p is CredentialsConfig => p.type === 'credentials'
  );
  if (!provider || typeof provider.authorize !== 'function') {
    throw new Error('CredentialsProvider or authorize function not found');
  }
  return provider.authorize;
}


describe('Authentication Integration Tests', () => {
  let authorize: NonNullable<CredentialsConfig['authorize']>;

  beforeAll(async () => {
    await dbConnect();
    const credentialsProvider = authOptions.providers.find(
      (p): p is CredentialsConfig => p.type === 'credentials'
    ) as CredentialsConfig;
    
    if (!credentialsProvider.authorize) {
      throw new Error('Authorize function not found in CredentialsProvider');
    }
    
    authorize = credentialsProvider.authorize;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('Login (authorize function)', () => {
    it('should authenticate a valid user', async () => {
      const user = new User({
        name: 'Login Test User',
        email: 'logintest@example.com',
        password: 'password123',
        role: 'customer',
      });
      await user.save();

      const result = await authorize(
        { email: 'logintest@example.com', password: 'password123' },
        { } as any // Empty request object
      );

      expect(result).toBeTruthy();
      expect(result).toHaveProperty('email', 'logintest@example.com');
      expect(result).toHaveProperty('name', 'Login Test User');
      expect(result).toHaveProperty('role', 'customer');
    });

    it('should not authenticate with incorrect password', async () => {
      const user = new User({
        name: 'Wrong Password User',
        email: 'wrongpass@example.com',
        password: 'correctpassword',
        role: 'customer',
      });
      await user.save();

      await expect(authorize(
        { email: 'wrongpass@example.com', password: 'wrongpassword' },
        { } as any // Empty request object
      )).rejects.toThrow('Invalid password');
    });

    it('should not authenticate non-existent user', async () => {
      await expect(authorize(
        { email: 'nonexistent@example.com', password: 'anypassword' },
        { } as any // Empty request object
      )).rejects.toThrow('No user found with this email');
    });
  });
});