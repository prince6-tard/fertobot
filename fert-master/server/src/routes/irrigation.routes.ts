import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import Probe from '../models/Probe';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';
import { deliverCommand } from '../services/commandQueue';

const router = Router();

// Get irrigation schedule
router.get('/schedule', async (_req: AuthRequest, res, next) => {
  try {
    res.status(200).json({
      success: true,
      statusCode: 200,
      data: [],
    });
  } catch (error) {
    next(error);
  }
});

// Control sprinkler
router.post('/control', async (req: AuthRequest, res, next) => {
  try {
    const { probeId, probeUuid, relay, pump, durationMs, buzzerMs } = req.body as {
      probeId?: string;
      probeUuid?: string;
      relay?: 'on' | 'off';
      pump?: boolean;
      durationMs?: number;
      buzzerMs?: number;
    };

    if (!probeId && !probeUuid) {
      throw new AppError('probeId or probeUuid is required', 400);
    }

    if (relay === undefined && pump === undefined) {
      throw new AppError('Either relay or pump command is required', 400);
    }

    // findById throws CastError on invalid ObjectIds — catch it and fall through to uuid lookup.
    // Guard against undefined probeUuid: findOne({ uuid: undefined }) strips the key in Mongoose
    // and becomes findOne({}) which returns a random probe.
    let probe = probeId
      ? await Probe.findById(probeId).catch(() => null) ?? (probeUuid ? await Probe.findOne({ uuid: probeUuid }) : null)
      : probeUuid ? await Probe.findOne({ uuid: probeUuid }) : null;

    // Auto-provision the probe if it doesn't exist yet (ESP32 may not have sent a reading yet)
    if (!probe && probeUuid) {
      const owner = await User.findOne({ isActive: true }).lean();
      if (owner) {
        probe = await Probe.create({
          userId: owner._id,
          uuid: probeUuid,
          name: `ESP32 ${probeUuid}`,
          serialNumber: probeUuid,
          firmwareVersion: '2.0.0',
          location: { fieldName: 'Field 1', latitude: 0, longitude: 0, areaSize: 0 },
          isActive: true,
        });
        logger.info(`Auto-provisioned probe via irrigation control: ${probeUuid}`);
      }
    }

    logger.info(`Irrigation command — probeId: ${probeId}, probeUuid: ${probeUuid}, probe resolved: ${probe?.uuid ?? 'none'}`);

    if (!probe || !probe.isActive) {
      throw new AppError('Probe not found or inactive', 404);
    }

    if (req.user?.id && probe.userId.toString() !== req.user.id) {
      throw new AppError('Unauthorized', 403);
    }

    const commandPayload: Record<string, unknown> = {};

    if (relay !== undefined) {
      commandPayload.relay = relay;
    }

    if (pump !== undefined) {
      commandPayload.pump = pump;
    }

    if (durationMs !== undefined) {
      commandPayload.durationMs = durationMs;
    }

    if (buzzerMs !== undefined) {
      commandPayload.buzzerMs = buzzerMs;
    }

    // Deliver command via in-memory queue (no MongoDB) for instant local response.
    // If the ESP32 is connected via long-poll it gets the command in <1ms.
    // If not connected, it's queued and delivered when ESP32 next connects.
    deliverCommand(probe.uuid, commandPayload);

    logger.info(`Command stored for ESP32 ${probe.uuid}: ${JSON.stringify(commandPayload)}`);

    res.status(200).json({
      success: true,
      message: 'Sprinkler control command sent to probe',
      statusCode: 200,
      data: {
        probeId: probe._id,
        probeUuid: probe.uuid,
        command: commandPayload,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
