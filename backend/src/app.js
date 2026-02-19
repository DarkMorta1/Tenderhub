import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import kycRoutes from './routes/kycRoutes.js';
import requirementRoutes from './routes/requirementRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export const createApp = () => {
  const app = express();

  const allowedOrigins = [
    ENV.CLIENT_URL,
    // commonly used dev ports — allow localhost on nearby ports
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ].filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        // allow requests with no origin (like mobile apps, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS not allowed by server'), false);
      },
      credentials: true
    })
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan('dev'));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/kyc', kycRoutes);
  app.use('/api/requirements', requirementRoutes);
  app.use('/api/bids', bidRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/vendors', vendorRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

