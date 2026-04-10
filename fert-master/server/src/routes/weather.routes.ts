import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Get weather forecast
router.get('/forecast', async (req: AuthRequest, res, next) => {
  try {
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;

    // TODO: Integrate with OpenWeather API
    res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        message: 'Weather API integration pending',
        location: { latitude, longitude },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
