// # Agent-specific logic (view assigned parcels, update status)
// agent.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as agentService from '@services/agent.service';
import { logger } from '@utils/logger';

export const listAgents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRole = req.user?.role;
    if (!userRole) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const result = await agentService.listAgents();

    logger.info(`Agent list total ${result.data.length} fetched successfully`);
    res
      .status(200)
      .json({
        success: true,
        message: 'Agent list fetched successfully',
        data: result.data,
      });
  } catch (error) {
    next(error);
    return;
  }
  return;
};

/**
 * Updates the isActive status of a specific agent.
 */
export const updateAgentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { agentId } = req.params;
    const { isActive } = req.body;

    const result = await agentService.updateAgentStatus(agentId, isActive);

    logger.info(`Agent ${agentId} status updated to ${isActive}`);
    res.status(200).json({
      success: true,
      message: 'Agent status updated successfully',
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};
