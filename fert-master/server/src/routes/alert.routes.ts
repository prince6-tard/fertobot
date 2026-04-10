import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Get alerts
router.get('/', async (_req: AuthRequest, res, next) => {
  try {
    // TODO: Implement alerts fetching from database
    res.status(200).json({
      success: true,
      statusCode: 200,
      data: [],
    });
  } catch (error) {
    next(error);
  }
});

export default router;
