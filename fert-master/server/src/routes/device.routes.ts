import { Router, Request, Response, NextFunction } from 'express';
import SensorReading from '../models/SensorReading';
import Probe from '../models/Probe';
import User from '../models/User';
import logger from '../config/logger';
import { waitForCommand, consumeCommand } from '../services/commandQueue';

const router = Router();

/* -------------------------------------------------------
 * In-memory motion event store (survives as long as server
 * is up; keeps last 100 events to avoid unbounded growth).
 * ------------------------------------------------------- */
interface MotionEvent {
  timestamp: number; // ms since epoch
  device: string;
  location: string;
  message: string;
}
const motionEvents: MotionEvent[] = [];
const MAX_MOTION_EVENTS = 100;

function recordMotion(device: string) {
  const ts = Date.now();
  // Debounce: ignore if same device fired within last 10 s
  const last = motionEvents.findLast?.(e => e.device === device) ??
    [...motionEvents].reverse().find(e => e.device === device);
  if (last && ts - last.timestamp < 10_000) return;

  const event: MotionEvent = {
    timestamp: ts,
    device,
    location: 'Field area',
    message: `Motion detected by ${device}`,
  };
  motionEvents.push(event);
  if (motionEvents.length > MAX_MOTION_EVENTS) motionEvents.shift();
  logger.info(`Motion event recorded — device: ${device}`);
}

// Simple API key middleware for IoT devices (no JWT needed)
const deviceAuth = (req: Request, res: Response, next: NextFunction): void => {
  const key = req.headers['x-api-key'];
  // Match the key baked into the ESP32 firmware
  const validKey = process.env.DEVICE_API_KEY || 'fertobot-esp32-key-2024';

  if (!key || key !== validKey) {
    res.status(401).json({ success: false, message: 'Invalid device API key' });
    return;
  }
  next();
};

/**
 * Auto-provision a probe document the first time an unknown ESP32 UUID
 * sends data, so the device works without manual DB setup.
 * Assigns the probe to the first active user found in the DB.
 */
async function findOrCreateProbe(probeUuid: string) {
  const existing = await Probe.findOne({ uuid: probeUuid });
  if (existing) return existing;

  // Find any active user to own the auto-provisioned probe
  const owner = await User.findOne({ isActive: true }).lean();
  if (!owner) {
    logger.warn(`No users in DB — cannot auto-provision probe ${probeUuid}`);
    return null;
  }

  const probe = await Probe.create({
    userId: owner._id,
    uuid: probeUuid,
    name: `ESP32 ${probeUuid}`,
    serialNumber: probeUuid,
    firmwareVersion: '2.0.0',
    location: { fieldName: 'Field 1', latitude: 0, longitude: 0, areaSize: 0 },
    isActive: true,
  });

  logger.info(`Auto-provisioned probe: ${probeUuid} → owner: ${owner.email}`);
  return probe;
}

/**
 * POST /api/device/reading
 * Called by ESP32 every 30 s. Auto-creates the probe if unknown.
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
      signalStrength: rawSignal = 100,
      motionDetected = false,
    } = req.body;

    // ESP32 sends WiFi RSSI as a negative dBm value (e.g. -70).
    // Convert to 0-100 percentage so Mongoose min/max validation passes.
    const signalStrength = typeof rawSignal === 'number' && rawSignal < 0
      ? Math.round(Math.max(0, Math.min(100, (rawSignal + 100) * 2)))
      : Math.min(100, Math.max(0, rawSignal));

    if (!probeUuid || soilMoisture === undefined || temperature === undefined) {
      res.status(400).json({ success: false, message: 'Missing required fields: probeUuid, soilMoisture, temperature' });
      return;
    }

    const probe = await findOrCreateProbe(probeUuid);
    if (!probe) {
      res.status(503).json({ success: false, message: 'No users registered yet — create an account first' });
      return;
    }

    const now = new Date();

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

    await Probe.findByIdAndUpdate(probe._id, {
      status: 'online',
      lastActive: now,
      lastReading: reading._id,
      'battery.level': batteryLevel,
      'battery.lastUpdated': now,
      'wifi.signalStrength': signalStrength,
      'wifi.lastConnected': now,
    });

    // Record motion event if PIR fired
    if (motionDetected) recordMotion(probeUuid);

    // Check for any pending pump/relay command and piggyback it onto this response
    // so the ESP32 executes it even when the long-poll connection is blocked by a firewall.
    const pendingCmd = consumeCommand(probeUuid);

    logger.info(`Reading saved — probe: ${probeUuid}, temp: ${temperature}, moisture: ${soilMoisture}${motionDetected ? ' [MOTION]' : ''}${pendingCmd ? ' [CMD:' + JSON.stringify(pendingCmd) + ']' : ''}`);

    res.status(201).json({
      success: true,
      message: 'Reading saved',
      data: {
        id: reading._id,
        timestamp: now,
        ...(pendingCmd && { command: pendingCmd }),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/device/command/wait?probeUuid=FBOT-1001   ← NEW: long-poll, instant delivery
 * ESP32 connects and the server holds the request open until a command arrives.
 * Responds immediately if a command is already queued.
 * Returns 204 after 25 s if nothing arrives (ESP32 should reconnect immediately).
 * No MongoDB involved — purely in-memory.
 */
router.get('/command/wait', deviceAuth, (req: Request, res: Response) => {
  const { probeUuid } = req.query as { probeUuid?: string };
  if (!probeUuid) {
    res.status(400).json({ success: false, message: 'Missing probeUuid' });
    return;
  }
  logger.info(`ESP32 ${probeUuid} connected — holding for command`);
  waitForCommand(probeUuid, res, req, 25000);
});

/**
 * GET /api/device/command?probeUuid=FBOT-1001   ← legacy short-poll (kept as fallback)
 * Polled by ESP32 every 10 s to fetch pending relay/buzzer commands.
 * Returns 204 when no command is queued.
 */
router.get('/command', deviceAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { probeUuid } = req.query;
    if (!probeUuid) {
      res.status(400).json({ success: false, message: 'Missing probeUuid' });
      return;
    }

    const probe = await Probe.findOne({ uuid: probeUuid as string });
    if (!probe) {
      res.status(204).end();
      return;
    }

    const command = probe.metadata?.pendingCommand;
    if (!command) {
      res.status(204).end();
      return;
    }

    logger.info(`Command delivered to ESP32 ${probeUuid}: ${JSON.stringify(command)}`);
    res.status(200).json(command);
    Probe.findByIdAndUpdate(probe._id, { $unset: { 'metadata.pendingCommand': 1 } }).catch(
      (err: Error) => logger.error(`Failed to clear command for ${probeUuid}: ${err.message}`)
    );
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/device/motion?since=<ms_timestamp>
 * Frontend polls this to get new motion events.
 * Returns the latest event that occurred after `since`.
 */
router.get('/motion', (_req: Request, res: Response) => {
  const since = parseInt((_req.query.since as string) || '0', 10);
  const newEvents = motionEvents.filter(e => e.timestamp > since);
  if (newEvents.length === 0) {
    res.json({ ok: true, hasNewMotion: false });
    return;
  }
  const latest = newEvents[newEvents.length - 1];
  res.json({ ok: true, hasNewMotion: true, motion: latest });
});

// GET /api/device/ping  — ESP32 connectivity check
router.get('/ping', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'pong', timestamp: new Date() });
});

/**
 * GET /api/device/status?probeUuid=FBOT-1001
 * No API key required — for browser-based debugging.
 * Shows whether the probe exists and if a command is pending.
 */
router.get('/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { probeUuid } = req.query;
    if (!probeUuid) {
      res.status(400).json({ success: false, message: 'Missing probeUuid' });
      return;
    }
    const probe = await Probe.findOne({ uuid: probeUuid as string });
    if (!probe) {
      res.json({
        success: false,
        message: 'Probe not found — ESP32 has not sent a reading yet and button has not been pressed',
        probeUuid,
      });
      return;
    }
    res.json({
      success: true,
      probe: {
        uuid: probe.uuid,
        isActive: probe.isActive,
        status: probe.status,
        lastActive: probe.lastActive,
        pendingCommand: probe.metadata?.pendingCommand ?? null,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
