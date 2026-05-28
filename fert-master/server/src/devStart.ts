/**
 * devStart.ts — starts an in-memory MongoDB then boots the Express server.
 * Auto-seeds the admin user so login works immediately after every restart.
 * Usage: ts-node-dev --respawn --transpile-only src/devStart.ts
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

async function seedAdmin() {
  // Dynamic import to avoid circular dep issues before mongoose connects
  const UserModel = (await import('./models/User')).default;
  const existing = await UserModel.findOne({ email: 'naveen@vizilare.com' });
  if (existing) return;
  const hashed = await bcrypt.hash('fertobot2024', 10);
  await UserModel.create({
    email: 'naveen@vizilare.com',
    password: hashed,
    firstName: 'Naveen',
    lastName: 'Vizilare',
    isActive: true,
  });
  console.log('[devStart] Admin user seeded: naveen@vizilare.com / fertobot2024');
}

async function start() {
  const mongod = await MongoMemoryServer.create({
    instance: { dbName: 'fertobot' }, // random port — avoids conflict on ts-node-dev respawn
  });

  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  console.log(`[devStart] In-memory MongoDB running at: ${uri}`);

  // Connect mongoose so we can seed before the app imports
  await mongoose.connect(uri);
  await seedAdmin();

  // Boot the main app
  await import('./index');
}

start().catch((err) => {
  console.error('[devStart] Failed to start:', err);
  process.exit(1);
});
