import { Router } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get current user profile
router.get('/profile', async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/profile', async (req: AuthRequest, res, next) => {
  try {
    const updates = req.body;

    // Allowed fields for update
    const allowedUpdates = [
      'firstName',
      'lastName',
      'phone',
      'avatar',
      'farm',
      'preferences',
    ];

    const updateData: any = {};
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user?.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      statusCode: 200,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
