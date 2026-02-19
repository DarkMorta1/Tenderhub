import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async () => {
  try {
    if (!ENV.MONGO_URI) {
      throw new Error('MONGO_URI is not set');
    }
    await mongoose.connect(ENV.MONGO_URI, {
      autoIndex: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

