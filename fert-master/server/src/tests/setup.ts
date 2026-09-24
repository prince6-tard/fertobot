import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User';
import Probe from '../models/Probe';
import jwt from 'jsonwebtoken';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

export const seedUser = async () => {
  const user = await User.create({
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    isVerified: true,
  });

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1d' }
  );

  return { user, token };
};

export const seedProbe = async (userId: mongoose.Types.ObjectId, uuid = 'test-probe-1') => {
  return await Probe.create({
    userId,
    uuid,
    name: 'Test Probe',
    serialNumber: `SN-${Date.now()}`,
    location: {
      fieldName: 'Test Field',
      latitude: 0,
      longitude: 0,
    },
    status: 'online',
  });
};
