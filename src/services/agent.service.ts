// # Agent business logic (fetch assigned parcels, status updates)
// agent.service.ts

import { User } from '@models/index';
import { logger } from '@utils/logger';
import { DatabaseError } from '@utils/errorHandler';
import { UserResponse } from 'types/auth.types';
import { AppError } from '@utils/errorHandler';
import { getIO, getUserSocketId } from '../config/socket';

export const listAgents = async (): Promise<{
  success: boolean;
  data: UserResponse[];
}> => {
  try {
    const agentsFromDb = await User.find({ role: 'agent' }).select('-password');

    if (!agentsFromDb) {
      throw new AppError('No agents found', 404);
    }

    // Map the Mongoose documents to your UserResponse DTO
    const agentsData: UserResponse[] = agentsFromDb.map((agent) => {
      return {
        _id: agent.id,
        customerName: agent.customerName,
        email: agent.email,
        phone: agent.phone,
        address: agent.address,
        role: agent.role,
        isActive: agent.isActive,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
      };
    });

    return { success: true, data: agentsData };
  } catch (error) {
    logger.error('Error listing agents:', error);
    throw new DatabaseError('Error fetching agents');
  }
};

/**
 * Updates an agent's isActive status in the database.
 * @param {string} agentId - The ID of the agent to update.
 * @param {boolean} isActive - The new status to set.
 * @returns {Promise<{ success: boolean; data: UserResponse }>} The updated agent data.
 */
export const updateAgentStatus = async (
  agentId: string,
  isActive: boolean
): Promise<{ success: boolean; data: UserResponse }> => {
  try {
    const agent = await User.findById(agentId);

    if (!agent) {
      throw new AppError('Agent not found with this ID', 404);
    }

    if (agent.role !== 'agent') {
      throw new AppError('This user is not an agent', 400);
    }

    agent.isActive = isActive;
    await agent.save();

    // Manually map to the DTO to exclude the password
    const updatedAgentData: UserResponse = {
      _id: agent.id,
      customerName: agent.customerName,
      email: agent.email,
      phone: agent.phone,
      address: agent.address,
      role: agent.role,
      isActive: agent.isActive,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    };

    // --- THIS BLOCK IS FIXED ---
    // Use the 'agent' variable to check for existence
    if (agent) {
      const socketId = getUserSocketId(agentId);
      if (socketId) {
        // Emit the clean data object, not the full Mongoose document
        getIO().to(socketId).emit('user:status-updated', updatedAgentData);
      }
    }
    // -------------------------

    return { success: true, data: updatedAgentData };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(`Error updating agent status for ID ${agentId}:`, error);
    throw new DatabaseError('Error updating agent status');
  }
};
