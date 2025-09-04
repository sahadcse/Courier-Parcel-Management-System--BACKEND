// # Agent API endpoints
// agent.routes.ts

import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as agentController from '../controllers/agent.controller';
import { validate } from '../middlewares/validation.middleware';
import { updateStatusSchema } from '../validation/agent.validation';

const router = Router();

/**
 * @route   GET /api/v1/agent/all
 * @desc    Get all agents (Admin only)
 * @access  Private (Admin)
 */
router.get('/all', authMiddleware(['admin']), agentController.listAgents);

/**
 * @route   PATCH /api/v1/agent/status/:agentId
 * @desc    Update an agent's active status (Admin only)
 * @access  Private (Admin)
 */
router.patch(
  '/status/:agentId',
  authMiddleware(['admin']),
  validate(updateStatusSchema),
  agentController.updateAgentStatus
);

export default router;
