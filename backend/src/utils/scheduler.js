import { User } from "../models/User.model.js";
import mongoose from "mongoose";

/**
 * Process expired bans and unban users automatically
 * This function should be called periodically
 */
export const processExpiredBans = async () => {
  try {
    const now = new Date();
    
    // Find all users with expired bans
    const result = await User.updateMany(
      {
        isBanned: true,
        banExpiresAt: { $lt: now },
      },
      {
        $set: {
          isBanned: false,
          banReason: null,
          banExpiresAt: null,
        }
      }
    );
    
    console.log(`Auto-unbanned ${result.modifiedCount} users with expired bans.`);
    return result.modifiedCount;
  } catch (error) {
    console.error("Error processing expired bans:", error);
    throw error;
  }
};

/**
 * Schedule a function to run at specific intervals
 * @param {Function} fn - The function to schedule
 * @param {number} interval - Interval in milliseconds
 * @returns {object} - Timer reference that can be used to clear the interval
 */
export const scheduleTask = (fn, interval) => {
  return setInterval(fn, interval);
};
