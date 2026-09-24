import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import Probe from '../models/Probe';
import User from '../models/User';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler';
import logger from '../config/logger';
import { deliverCommand } from '../services/commandQueue';
import { validate } from '../middleware/validate';
import { controlBodySchema } from '../schemas/irrigation.schemas';

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

router.post('/control', validate('body', controlBodySchema), async (req: AuthRequest, res, next) => {
  try {
    const { probeId, probeUuid, relay, pump, durationMs, buzzerMs } = req.body as {
      probeId?: string;
      probeUuid?: string;
      relay?: 'on' | 'off';
      pump?: boolean;
      durationMs?: number;
      buzzerMs?: number;
    };

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
      throw new NotFoundError('Probe');
    }

    if (req.user?.id && probe.userId.toString() !== req.user.id) {
      throw new ForbiddenError();
    }

    const commandPayload: Record<string, unknown> = {};

    // INVERSION FOR ACTIVE-LOW RELAY:
    // User click "START" (on) -> We send LOW (off) to ESP32 -> Relay turns ON
    // User click "STOP" (off) -> We send HIGH (on) to ESP32 -> Relay turns OFF

    if (relay !== undefined) {
      // Invert relay: 'on' becomes 'off', 'off' becomes 'on'
      commandPayload.relay = relay === 'on' ? 'off' : 'on';
      
      // Keep pump boolean in sync with the inverted relay
      if (pump === undefined) {
        commandPayload.pump = (relay === 'off'); // if relay was 'off', pump becomes true (inverted)
      }
    }

    if (pump !== undefined) {
      // Invert pump: true becomes false, false becomes true
      commandPayload.pump = !pump;
      
      // Keep relay string in sync with the inverted pump
      if (relay === undefined) {
        commandPayload.relay = pump ? 'off' : 'on';
      }
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
