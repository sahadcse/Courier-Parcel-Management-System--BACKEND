// # Agent API endpoints (/agent/parcels, /agent/update-status)
// agent.routes.ts

import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as agentController from '../controllers/agent.controller';
import { validate } from '../middlewares/validation.middleware';
import { updateStatusSchema } from '../validation/agent.validation';

const router = Router();

// GET /v1/agent/all → List agents (role: admin)
router.get('/all', authMiddleware(['admin']), agentController.listAgents);

// PATCH /v1/agent/status/:agentId → Update agent's active status (role: admin)
router.patch(
  '/status/:agentId',
  authMiddleware(['admin']),
  validate(updateStatusSchema),
  agentController.updateAgentStatus
);

export default router;
