import 'dotenv/config';
import { connect_DB } from '../db/index.js';
import { processExpiredBans } from '../utils/scheduler.js';
import { User } from '../models/User.model.js';
import mongoose from 'mongoose';

const checkUserBanStatus = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid user ID format');
      return;
    }
    
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found');
      return;
    }
    
    if (!user.isBanned) {
      console.log(`User ${user.username} (${user._id}) is not banned`);
      return;
    }
    
    const now = new Date();
    
    if (user.banExpiresAt && now > user.banExpiresAt) {
      console.log(`User ${user.username} (${user._id}) ban has expired. Unbanning...`);
      user.isBanned = false;
      user.banReason = null;
      user.banExpiresAt = null;
      await user.save();
      console.log('User unbanned successfully.');
    } else {
      const expiryString = user.banExpiresAt 
        ? `until ${user.banExpiresAt.toLocaleDateString()} ${user.banExpiresAt.toLocaleTimeString()}`
        : 'permanently';
      console.log(`User ${user.username} (${user._id}) is banned ${expiryString}`);
      console.log(`Reason: ${user.banReason || 'No reason provided'}`);
    }
  } catch (error) {
    console.error('Error checking user ban status:', error);
  }
};

const listBannedUsers = async () => {
  try {
    const bannedUsers = await User.find({ isBanned: true }).select('username email banReason banExpiresAt');
    
    if (bannedUsers.length === 0) {
      console.log('No users are currently banned');
      return;
    }
    
    console.log(`Found ${bannedUsers.length} banned users:`);
    console.log('-----------------------------------');
    
    for (const user of bannedUsers) {
      const expiryString = user.banExpiresAt 
        ? `until ${user.banExpiresAt.toLocaleDateString()} ${user.banExpiresAt.toLocaleTimeString()}`
        : 'permanently';
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Ban status: Banned ${expiryString}`);
      console.log(`Reason: ${user.banReason || 'No reason provided'}`);
      console.log('-----------------------------------');
    }
  } catch (error) {
    console.error('Error listing banned users:', error);
  }
};

const main = async () => {
  try {
    await connect_DB();
    console.log('Connected to database');
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'process-expired':
        console.log('Processing expired bans...');
        const result = await processExpiredBans();
        console.log(`Processed expired bans. Unbanned ${result} users.`);
        break;
        
      case 'check-user':
        if (!args[1]) {
          console.error('Please provide a user ID');
          break;
        }
        await checkUserBanStatus(args[1]);
        break;
        
      case 'list':
        await listBannedUsers();
        break;
        
      default:
        console.log('Available commands:');
        console.log('  - process-expired: Process all expired bans');
        console.log('  - check-user <userId>: Check ban status for a specific user');
        console.log('  - list: List all currently banned users');
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from database');
  } catch (error) {
    console.error('Error:', error);
  }
};

main();
