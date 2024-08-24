// File: src/__tests__/models/User.test.ts
import mongoose from 'mongoose';
import User from '@/models/User';

describe('User Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/testdb');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({}); // Clear the users collection before each test
  });

  it('should create & save user successfully', async () => {
    const validUser = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });
    const savedUser = await validUser.save();
    
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(validUser.name);
    expect(savedUser.email).toBe(validUser.email);
    expect(savedUser.role).toBe('customer');
  });

  it('should fail to save user with missing required fields', async () => {
    const userWithoutRequiredField = new User({ name: 'John Doe' });
    let err;
    try {
      await userWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should not save plain text password', async () => {
    const user = new User({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    });
    await user.save();
    expect(user.password).not.toBe('password123');
  });

  it('should correctly compare passwords', async () => {
    const user = new User({
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: 'password123',
    });
    await user.save();

    const isMatch = await user.comparePassword('password123');
    expect(isMatch).toBe(true);

    const isNotMatch = await user.comparePassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });
});