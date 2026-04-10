import { Router } from 'express';
import Probe from '../models/Probe';
import Alert from '../models/Alert';
import SensorReading from '../models/SensorReading';

const router = Router();

router.get('/overview', async (_req, res, next) => {
  try {
    const [probes, alerts, recentReadings] = await Promise.all([
      Probe.find({ isActive: true })
        .sort({ lastActive: -1 })
        .populate('lastReading')
        .lean(),
      Alert.find({ isResolved: false })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      SensorReading.find({ timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
        .sort({ timestamp: -1 })
        .limit(200)
        .lean(),
    ]);

    const summary = {
      totalProbes: probes.length,
      onlineProbes: probes.filter((probe) => probe.status === 'online').length,
      offlineProbes: probes.filter((probe) => probe.status === 'offline').length,
      maintenanceProbes: probes.filter((probe) => probe.status === 'maintenance').length,
      activeAlerts: alerts.length,
      criticalAlerts: alerts.filter((alert) => alert.type === 'critical').length,
      averageBattery: probes.length
        ? Math.round(probes.reduce((total, probe) => total + (probe.battery?.level ?? 0), 0) / probes.length)
        : 0,
      averageMoisture: recentReadings.length
        ? Math.round(recentReadings.reduce((total, reading) => total + reading.soilMoisture, 0) / recentReadings.length)
        : 0,
      averageTemperature: recentReadings.length
        ? Number((recentReadings.reduce((total, reading) => total + reading.temperature, 0) / recentReadings.length).toFixed(1))
        : 0,
      averageHumidity: recentReadings.length
        ? Math.round(recentReadings.reduce((total, reading) => total + reading.humidity, 0) / recentReadings.length)
        : 0,
    };

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        probes,
        alerts,
        recentReadings,
        summary,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;