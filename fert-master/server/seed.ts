import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;

// ── Inline schemas (avoids import path issues) ────────────────────────────────

const UserSchema = new mongoose.Schema(
  {
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    role: { type: String, default: 'user' },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
    farm: mongoose.Schema.Types.Mixed,
    preferences: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const ProbeSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    uuid: String,
    name: String,
    status: { type: String, default: 'online' },
    serialNumber: String,
    firmwareVersion: { type: String, default: '2.1.0' },
    location: {
      fieldName: String,
      latitude: Number,
      longitude: Number,
      areaSize: Number,
    },
    battery: { level: Number, lastUpdated: Date },
    wifi: { ssid: String, signalStrength: Number, lastConnected: Date },
    calibration: { lastCalibrated: Date, nextDueDate: Date, isCalibrationOverdue: Boolean },
    lastActive: { type: Date, default: Date.now },
    installationDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SensorReadingSchema = new mongoose.Schema(
  {
    probeId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    timestamp: { type: Date, default: Date.now },
    soilMoisture: Number,
    temperature: Number,
    humidity: Number,
    pH: Number,
    conductivity: Number,
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    waterTankLevel: Number,
    batteryLevel: Number,
    signalStrength: Number,
    isAnomaly: { type: Boolean, default: false },
  }
);

const User = mongoose.model('User', UserSchema);
const Probe = mongoose.model('Probe', ProbeSchema);
const SensorReading = mongoose.model('SensorReading', SensorReadingSchema);

// ── Helpers ───────────────────────────────────────────────────────────────────

const rand = (min: number, max: number, decimals = 1) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

// ── Seed ──────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing demo data
  await User.deleteMany({ email: 'demo@fertobot.com' });
  const existingUser = await User.findOne({ email: 'demo@fertobot.com' });
  if (!existingUser) {
    await Probe.deleteMany({});
    await SensorReading.deleteMany({});
  }

  // 1. Create demo user
  const hashedPassword = await bcrypt.hash('demo1234', 10);
  const user = await User.create({
    email: 'demo@fertobot.com',
    password: hashedPassword,
    firstName: 'Demo',
    lastName: 'Farmer',
    role: 'user',
    isActive: true,
    isVerified: true,
    farm: {
      name: 'Green Valley Farm',
      area: 12.5,
      location: { latitude: 28.6139, longitude: 77.209 },
      soilType: 'Loamy',
      region: 'North India',
    },
    preferences: {
      language: 'en',
      notifications: true,
      emailAlerts: true,
      pushNotifications: true,
      theme: 'light',
    },
  });
  console.log('Created demo user: demo@fertobot.com / demo1234');

  // 2. Create 3 probes
  const probeData = [
    { name: 'Field A - North', fieldName: 'North Wheat Field', lat: 28.614, lng: 77.210, area: 4200 },
    { name: 'Field B - South', fieldName: 'South Rice Paddy', lat: 28.612, lng: 77.208, area: 3800 },
    { name: 'Greenhouse 1',   fieldName: 'Greenhouse Zone',   lat: 28.615, lng: 77.211, area: 800  },
  ];

  const now = new Date();
  const probes = await Promise.all(
    probeData.map((p, i) =>
      Probe.create({
        userId: user._id,
        uuid: `FBOT-${1001 + i}`,
        name: p.name,
        status: 'online',
        serialNumber: `SN-2024-${1001 + i}`,
        firmwareVersion: '2.1.0',
        location: { fieldName: p.fieldName, latitude: p.lat, longitude: p.lng, areaSize: p.area },
        battery: { level: rand(70, 98, 0), lastUpdated: now },
        wifi: { ssid: 'FarmNet-5G', signalStrength: rand(65, 95, 0), lastConnected: now },
        calibration: {
          lastCalibrated: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          nextDueDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
          isCalibrationOverdue: false,
        },
        lastActive: now,
        isActive: true,
      })
    )
  );
  console.log(`Created ${probes.length} probes`);

  // 3. Create 7 days of readings (one every 30 min = 336 per probe)
  const readings: any[] = [];
  const DAYS = 7;
  const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
  const totalPoints = (DAYS * 24 * 60 * 60 * 1000) / INTERVAL_MS;

  for (const probe of probes) {
    for (let i = totalPoints; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * INTERVAL_MS);
      const hourOfDay = timestamp.getHours();
      // Simulate realistic diurnal variation
      const tempBase = probe.name.includes('Greenhouse') ? 28 : 22;
      const tempSwing = hourOfDay >= 10 && hourOfDay <= 16 ? rand(3, 6) : 0;

      readings.push({
        probeId: probe._id,
        userId: user._id,
        timestamp,
        soilMoisture: rand(35, 75),
        temperature: tempBase + tempSwing + rand(-1, 1),
        humidity: rand(45, 85),
        pH: rand(5.8, 7.2),
        conductivity: rand(0.8, 2.5),
        nitrogen: rand(20, 60),
        phosphorus: rand(10, 40),
        potassium: rand(15, 50),
        waterTankLevel: Math.max(10, rand(30, 95) - (totalPoints - i) * 0.02),
        batteryLevel: Math.min(100, rand(75, 95) - (totalPoints - i) * 0.005),
        signalStrength: rand(60, 95),
        isAnomaly: Math.random() < 0.03, // 3% anomaly rate
      });
    }
  }

  // Insert in batches of 500
  for (let i = 0; i < readings.length; i += 500) {
    await SensorReading.insertMany(readings.slice(i, i + 500));
  }
  console.log(`Created ${readings.length} sensor readings across ${probes.length} probes`);

  console.log('\n✅ Seed complete!');
  console.log('   Login: demo@fertobot.com');
  console.log('   Password: demo1234');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
