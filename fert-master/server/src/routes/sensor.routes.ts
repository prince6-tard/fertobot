import { Router } from 'express';
import SensorReading from '../models/SensorReading';
import { AuthRequest } from '../middleware/auth';
import logger from '../config/logger';

const router = Router();

// Get latest sensor reading for a probe
router.get('/latest/:probeId', async (req: AuthRequest, res, next) => {
  try {
    const { probeId } = req.params;

    const reading = await SensorReading.findOne({ probeId })
      .sort({ timestamp: -1 })
      .lean();

    if (!reading) {
      res.status(404).json({
        success: false,
        message: 'No sensor readings found',
        statusCode: 404,
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: reading,
    });
  } catch (error) {
    next(error);
  }
});

// Get sensor readings for a time range
router.get('/range/:probeId', async (req: AuthRequest, res, next) => {
  try {
    const { probeId } = req.params;
    const { startDate, endDate, limit = 1000 } = req.query;

    const query: any = { probeId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    const readings = await SensorReading.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit as string))
      .lean();

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: readings,
    });
  } catch (error) {
    next(error);
  }
});

// Post new sensor reading (from ESP32)
router.post('/reading', async (req: AuthRequest, res, next) => {
  try {
    const {
      probeId,
      soilMoisture,
      temperature,
      humidity,
      pH,
      conductivity,
      nitrogen,
      phosphorus,
      potassium,
      waterTankLevel,
      batteryLevel,
      signalStrength,
    } = req.body;

    // Validation
    if (!probeId || soilMoisture === undefined || temperature === undefined) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields',
        statusCode: 400,
      });
      return;
    }

    // Detect anomalies
    const isAnomaly = false; // TODO: Implement ML-based anomaly detection

    const reading = await SensorReading.create({
      probeId,
      userId: req.user?.id,
      soilMoisture,
      temperature,
      humidity,
      pH,
      conductivity,
      nitrogen,
      phosphorus,
      potassium,
      waterTankLevel,
      batteryLevel,
      signalStrength,
      isAnomaly,
      timestamp: new Date(),
    });

    // Update probe last active and battery
    const Probe = require('../models/Probe').default;
    await Probe.findByIdAndUpdate(probeId, {
      lastActive: new Date(),
      'battery.level': batteryLevel,
      'battery.lastUpdated': new Date(),
      'wifi.signalStrength': signalStrength,
      lastReading: reading._id,
    });

    logger.info(`Sensor reading received from probe ${probeId}`);

    res.status(201).json({
      success: true,
      message: 'Sensor reading recorded',
      statusCode: 201,
      data: reading,
    });
  } catch (error) {
    next(error);
  }
});

// Get sensor statistics
router.get('/statistics/:probeId', async (req: AuthRequest, res, next) => {
  try {
    const { probeId } = req.params;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    const stats = await SensorReading.aggregate([
      {
        $match: {
          probeId: require('mongoose').Types.ObjectId(probeId),
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          avgMoisture: { $avg: '$soilMoisture' },
          minMoisture: { $min: '$soilMoisture' },
          maxMoisture: { $max: '$soilMoisture' },
          avgTemp: { $avg: '$temperature' },
          minTemp: { $min: '$temperature' },
          maxTemp: { $max: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          avgPH: { $avg: '$pH' },
          avgNitrogen: { $avg: '$nitrogen' },
          avgPhosphorus: { $avg: '$phosphorus' },
          avgPotassium: { $avg: '$potassium' },
          readingCount: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: stats[0] || {},
    });
  } catch (error) {
    next(error);
  }
});

export default router;
