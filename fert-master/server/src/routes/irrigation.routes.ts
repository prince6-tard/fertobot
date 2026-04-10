import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import Probe from '../models/Probe';
import { AppError } from '../middleware/errorHandler';
import { publishProbeControl } from '../services/mqtt.service';

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

    const probe = probeId
      ? await Probe.findById(probeId)
      : await Probe.findOne({ uuid: probeUuid });
    if (!probe || !probe.isActive) {
      throw new AppError('Probe not found', 404);
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

    await publishProbeControl(probe.uuid, commandPayload);

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
