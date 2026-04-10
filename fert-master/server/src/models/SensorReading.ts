import mongoose, { Schema, Document } from 'mongoose';

export interface ISensorReading extends Document {
  probeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  timestamp: Date;
  soilMoisture: number;
  temperature: number;
  humidity: number;
  pH: number;
  conductivity: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  waterTankLevel: number;
  batteryLevel: number;
  signalStrength: number;
  isAnomaly: boolean;
  anomalyReason?: string;
}

const sensorReadingSchema = new Schema<ISensorReading>(
  {
    probeId: {
      type: Schema.Types.ObjectId,
      ref: 'Probe',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    soilMoisture: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    humidity: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    pH: {
      type: Number,
      min: 0,
      max: 14,
      required: true,
    },
    conductivity: {
      type: Number,
      default: 0,
    },
    nitrogen: {
      type: Number,
      default: 0,
    },
    phosphorus: {
      type: Number,
      default: 0,
    },
    potassium: {
      type: Number,
      default: 0,
    },
    waterTankLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    signalStrength: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    isAnomaly: {
      type: Boolean,
      default: false,
    },
    anomalyReason: String,
  },
  { timestamps: false }
);

// Index for efficient time-series queries
sensorReadingSchema.index({ probeId: 1, timestamp: -1 });
sensorReadingSchema.index({ userId: 1, timestamp: -1 });
sensorReadingSchema.index({ timestamp: -1 });

// TTL index - automatically delete old readings after 1 year
sensorReadingSchema.index(
  { timestamp: 1 },
  { 
    expireAfterSeconds: 365 * 24 * 60 * 60,
    name: 'sensorReadingTTL'
  }
);

export default mongoose.model<ISensorReading>('SensorReading', sensorReadingSchema);
