// # Admin API endpoints (/admin/dashboard, /admin/assign-agent)


import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as userController from '../controllers/admin.controller';

const router = Router();

/**
 * @route   GET /api/v1/admin/all
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
router.get(
  '/all',
  authMiddleware(['admin']), // Protects the route, only allows admins
  userController.getAllUsers
);

/**
 * @route   GET /api/v1/admin/analytics
 * @desc    Get dashboard analytics (Admin only)
 * @access  Private (Admin)
 */
router.get(
  '/analytics',
  authMiddleware(['admin']),
  userController.getDashboardAnalytics
);

export default router;
