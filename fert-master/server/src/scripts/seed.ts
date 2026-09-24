import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Probe from '../models/Probe';
import SensorReading from '../models/SensorReading';

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fertobot';
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 } as mongoose.ConnectOptions);
  console.log('✅ MongoDB connected successfully');
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Probe.deleteMany({});
    await SensorReading.deleteMany({});

    console.log('Generating 50 probes and readings...');
    
    const probes = [];
    const readings = [];

    // Create 50 probes
    for (let i = 1; i <= 50; i++) {
      const isOnline = Math.random() > 0.1; // 90% online
      const probe = new Probe({
        uuid: `probe-uuid-${i}`,
        name: `Field Sensor ${i}`,
        groupId: `group-${Math.ceil(i / 10)}`, // 5 groups
        status: isOnline ? 'online' : 'offline',
        battery: {
          level: Math.floor(Math.random() * 80) + 20, // 20-100%
          voltage: 3.7,
        },
        wifi: {
          ssid: 'Farm_WiFi',
          signalStrength: -Math.floor(Math.random() * 50 + 30), // -30 to -80 dBm
        },
        location: {
          latitude: 28.7 + (Math.random() * 0.1),
          longitude: 77.1 + (Math.random() * 0.1),
          fieldName: `Sector ${String.fromCharCode(64 + Math.ceil(i/10))}-${i}`,
        },
        lastActive: new Date(Date.now() - Math.floor(Math.random() * 100000)),
        firmwareVersion: '1.2.0',
        hardwareVersion: '1.0',
        isActive: true,
      });

      probes.push(probe);

      // Generate a reading for this probe if online
      if (isOnline) {
        // Randomize soil health somewhat realistically
        // NPK optimal: N:40-80, P:30-60, K:40-80
        const n = Math.floor(Math.random() * 60) + 10;
        const p = Math.floor(Math.random() * 50) + 10;
        const k = Math.floor(Math.random() * 70) + 10;
        
        const reading = new SensorReading({
          probeId: probe._id,
          timestamp: new Date(),
          soilMoisture: Math.floor(Math.random() * 60) + 20, // 20-80%
          temperature: Math.floor(Math.random() * 15) + 20, // 20-35 C
          humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
          pH: Number((Math.random() * 3 + 5.5).toFixed(1)), // 5.5 - 8.5
          conductivity: Math.floor(Math.random() * 500) + 500, // 500-1000
          nitrogen: n,
          phosphorus: p,
          potassium: k,
          waterTankLevel: Math.floor(Math.random() * 100),
          batteryLevel: probe.battery?.level || 100,
          signalStrength: probe.wifi?.signalStrength || -50,
          errorCodes: [],
        });
        
        readings.push(reading);
        
        // link last reading
        probe.lastReading = reading._id;
      }
    }

    await Probe.insertMany(probes);
    await SensorReading.insertMany(readings);

    // Save the updated probes with lastReading links
    for (const p of probes) {
      if (p.lastReading) {
        await Probe.findByIdAndUpdate(p._id, { lastReading: p.lastReading });
      }
    }

    console.log(`✅ Successfully inserted ${probes.length} probes and ${readings.length} readings.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();
