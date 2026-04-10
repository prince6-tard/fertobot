import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'technician';
  phone?: string;
  avatar?: string;
  farm?: {
    name: string;
    area: number;
    location: {
      latitude: number;
      longitude: number;
    };
    soilType: string;
    region: string;
  };
  preferences?: {
    language: string;
    notifications: boolean;
    emailAlerts: boolean;
    pushNotifications: boolean;
    theme: 'light' | 'dark';
  };
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'technician'],
      default: 'user',
    },
    phone: String,
    avatar: String,
    farm: {
      name: String,
      area: Number, // in hectares
      location: {
        latitude: Number,
        longitude: Number,
      },
      soilType: String,
      region: String,
    },
    preferences: {
      language: { type: String, default: 'en' },
      notifications: { type: Boolean, default: true },
      emailAlerts: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
