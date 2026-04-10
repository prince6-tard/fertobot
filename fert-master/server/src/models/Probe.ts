import mongoose, { Schema, Document } from 'mongoose';

export interface IProbe extends Document {
  userId: mongoose.Types.ObjectId;
  groupId?: mongoose.Types.ObjectId;
  uuid: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  serialNumber: string;
  firmwareVersion: string;
  location: {
    fieldName: string;
    latitude: number;
    longitude: number;
    areaSize: number; // in m²
  };
  battery: {
    level: number;
    lastUpdated: Date;
  };
  wifi: {
    ssid: string;
    signalStrength: number;
    lastConnected: Date;
  };
  calibration: {
    lastCalibrated: Date;
    nextDueDate: Date;
    isCalibrationOverdue: boolean;
  };
  lastReading?: mongoose.Types.ObjectId;
  lastActive: Date;
  installationDate: Date;
  metadata?: Record<string, any>;
  isActive: boolean;
}

const probeSchema = new Schema<IProbe>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'ProbeGroup',
    },
    uuid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide probe name'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'maintenance', 'error'],
      default: 'offline',
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
    },
    firmwareVersion: {
      type: String,
      default: '1.0.0',
    },
    location: {
      fieldName: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      areaSize: {
        type: Number,
        default: 0,
      },
    },
    battery: {
      level: {
        type: Number,
        min: 0,
        max: 100,
        default: 100,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    wifi: {
      ssid: String,
      signalStrength: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      lastConnected: Date,
    },
    calibration: {
      lastCalibrated: Date,
      nextDueDate: Date,
      isCalibrationOverdue: {
        type: Boolean,
        default: false,
      },
    },
    lastReading: {
      type: Schema.Types.ObjectId,
      ref: 'SensorReading',
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    installationDate: {
      type: Date,
      default: Date.now,
    },
    metadata: Schema.Types.Mixed,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

probeSchema.index({ userId: 1, isActive: 1 });
probeSchema.index({ uuid: 1 });
probeSchema.index({ lastActive: -1 });

export default mongoose.model<IProbe>('Probe', probeSchema);
