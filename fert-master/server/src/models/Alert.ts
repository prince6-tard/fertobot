import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  userId: mongoose.Types.ObjectId;
  probeId: mongoose.Types.ObjectId;
  type: 'critical' | 'warning' | 'info';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  parameter: string; // which sensor parameter triggered the alert
  value: number;
  threshold: number;
  recommendation: string;
  isResolved: boolean;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    probeId: {
      type: Schema.Types.ObjectId,
      ref: 'Probe',
      required: true,
    },
    type: {
      type: String,
      enum: ['critical', 'warning', 'info'],
      default: 'info',
    },
    severity: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    parameter: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    threshold: {
      type: Number,
      required: true,
    },
    recommendation: String,
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: Date,
    metadata: Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

alertSchema.index({ userId: 1, isResolved: 1, createdAt: -1 });
alertSchema.index({ probeId: 1, createdAt: -1 });

export default mongoose.model<IAlert>('Alert', alertSchema);
