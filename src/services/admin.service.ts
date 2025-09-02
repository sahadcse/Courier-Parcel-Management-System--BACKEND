// # Admin business logic (analytics, agent assignment)

// src/services/admin.service.ts

import { User } from '@models/user.model';
import { logger } from '@utils/logger';
import { DatabaseError } from '@utils/errorHandler';
import { UserResponse } from 'types/auth.types';
import { Parcel } from '@models/parcel.model';

/**
 * Retrieves all users from the database and formats them for response.
 * @returns {Promise<UserResponse[]>} A promise that resolves to an array of user data.
 */
export const getAllUsers = async (): Promise<UserResponse[]> => {
  try {
    // Find all users and explicitly exclude the password field for security
    const usersFromDb = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    // Map the Mongoose documents to the UserResponse DTO
    // This ensures a consistent response shape and prevents leaking extra fields.
    const usersData: UserResponse[] = usersFromDb.map((user) => ({
      _id: user.id,
      customerName: user.customerName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return usersData;
  } catch (error) {
    logger.error('Error fetching all users from database:', error);
    throw new DatabaseError('Could not retrieve users');
  }
};

export const getDashboardAnalytics = async () => {
  try {
    // Example: Daily bookings for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyBookings = await Parcel.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Example: COD Totals and Failed Deliveries
    const statusStats = await Parcel.aggregate([
      {
        $group: {
          _id: '$status',
          totalCodAmount: {
            $sum: {
              $cond: [{ $eq: ['$paymentType', 'COD'] }, '$codAmount', 0],
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    return { dailyBookings, statusStats };
  } catch (error) {
    logger.error('Error fetching dashboard analytics:', error);
    throw new DatabaseError('Could not retrieve dashboard analytics');
  }
};
