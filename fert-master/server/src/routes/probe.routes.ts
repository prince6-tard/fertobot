import { Router } from 'express';
import Probe from '../models/Probe';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get all probes for user
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const probes = await Probe.find({ userId: req.user?.id, isActive: true })
      .populate('lastReading')
      .lean();

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: probes,
    });
  } catch (error) {
    next(error);
  }
});

// Get single probe
router.get('/:probeId', async (req: AuthRequest, res, next) => {
  try {
    const { probeId } = req.params;

    const probe = await Probe.findById(probeId)
      .populate('lastReading')
      .populate('groupId');

    if (!probe) {
      throw new AppError('Probe not found', 404);
    }

    // Check ownership
    if (probe.userId.toString() !== req.user?.id) {
      throw new AppError('Unauthorized', 403);
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: probe,
    });
  } catch (error) {
    next(error);
  }
});

// Create new probe
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { uuid, name, serialNumber, location } = req.body;

    if (!uuid || !name || !serialNumber || !location) {
      throw new AppError('Missing required fields', 400);
    }

    const probe = await Probe.create({
      userId: req.user?.id,
      uuid,
      name,
      serialNumber,
      location,
      lastActive: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Probe created successfully',
      statusCode: 201,
      data: probe,
    });
  } catch (error) {
    next(error);
  }
});

// Update probe
router.put('/:probeId', async (req: AuthRequest, res, next) => {
  try {
    const { probeId } = req.params;
    const updates = req.body;

    const probe = await Probe.findById(probeId);
    if (!probe) {
      throw new AppError('Probe not found', 404);
    }

    // Check ownership
    if (probe.userId.toString() !== req.user?.id) {
      throw new AppError('Unauthorized', 403);
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'location', 'groupId', 'metadata'];
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        (probe as any)[key] = updates[key];
      }
    });

    await probe.save();

    res.status(200).json({
      success: true,
      message: 'Probe updated successfully',
      statusCode: 200,
      data: probe,
    });
  } catch (error) {
    next(error);
  }
});

// Delete probe
router.delete('/:probeId', async (req: AuthRequest, res, next) => {
  try {
    const { probeId } = req.params;

    const probe = await Probe.findById(probeId);
    if (!probe) {
      throw new AppError('Probe not found', 404);
    }

    if (probe.userId.toString() !== req.user?.id) {
      throw new AppError('Unauthorized', 403);
    }

    await Probe.findByIdAndUpdate(probeId, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Probe deleted successfully',
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
