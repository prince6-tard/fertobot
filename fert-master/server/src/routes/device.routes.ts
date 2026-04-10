import { Router, Request, Response, NextFunction } from 'express';
import SensorReading from '../models/SensorReading';
import Probe from '../models/Probe';
import logger from '../config/logger';

const router = Router();

// Simple API key middleware for IoT devices (no JWT needed)
const deviceAuth = (req: Request, res: Response, next: NextFunction): void => {
  const key = req.headers['x-api-key'];
  const validKey = process.env.DEVICE_API_KEY || 'fertobot-device-key';

  if (!key || key !== validKey) {
    res.status(401).json({ success: false, message: 'Invalid device API key' });
    return;
  }
  next();
};

/**
 * POST /api/device/reading
 * Called by ESP32. Body:
 * {
 *   probeUuid: "FBOT-1001",
 *   soilMoisture, temperature, humidity, pH,
 *   conductivity, nitrogen, phosphorus, potassium,
 *   waterTankLevel, batteryLevel, signalStrength
 * }
 * Header: x-api-key: <DEVICE_API_KEY>
 */
router.post('/reading', deviceAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      probeUuid,
      soilMoisture,
      temperature,
      humidity,
      pH,
      conductivity = 0,
      nitrogen = 0,
      phosphorus = 0,
      potassium = 0,
      waterTankLevel = 0,
      batteryLevel = 100,
      signalStrength = 100,
    } = req.body;

    if (!probeUuid || soilMoisture === undefined || temperature === undefined) {
      res.status(400).json({ success: false, message: 'Missing required fields: probeUuid, soilMoisture, temperature' });
      return;
    }

    // Look up probe by UUID
    const probe = await Probe.findOne({ uuid: probeUuid });
    if (!probe) {
      res.status(404).json({ success: false, message: `Probe not found: ${probeUuid}` });
      return;
    }

    const now = new Date();

    // Save reading
    const reading = await SensorReading.create({
      probeId: probe._id,
      userId: probe.userId,
      timestamp: now,
      soilMoisture,
      temperature,
      humidity: humidity ?? 0,
      pH: pH ?? 7,
      conductivity,
      nitrogen,
      phosphorus,
      potassium,
      waterTankLevel,
      batteryLevel,
      signalStrength,
      isAnomaly: false,
    });

    // Update probe status
    await Probe.findByIdAndUpdate(probe._id, {
      status: 'online',
      lastActive: now,
      lastReading: reading._id,
      'battery.level': batteryLevel,
      'battery.lastUpdated': now,
      'wifi.signalStrength': signalStrength,
      'wifi.lastConnected': now,
    });

    logger.info(`Device reading saved — probe: ${probeUuid}, temp: ${temperature}, moisture: ${soilMoisture}`);

    res.status(201).json({
      success: true,
      message: 'Reading saved',
      data: { id: reading._id, timestamp: now },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/device/ping  — ESP32 connectivity check
router.get('/ping', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'pong', timestamp: new Date() });
});

export default router;
