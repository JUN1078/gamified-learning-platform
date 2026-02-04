import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

// Load environment variables
dotenv.config();

// Import database
import { connectDB } from './config/database.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import characterRoutes from './routes/characterRoutes.js';
import mountainRoutes from './routes/mountainRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import badgeRoutes from './routes/badgeRoutes.js';
import cultureQuestRoutes from './routes/cultureQuestRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import missionRoutes from './routes/missionRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import peerReviewRoutes from './routes/peerReviewRoutes.js';
import setupRoutes from './routes/setupRoutes.js';
import debugRoutes from './routes/debugRoutes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

const app: Application = express();

/* =========================
   PORT (Railway-safe)
========================= */
const PORT = process.env.PORT;

if (!PORT) {
  throw new Error('PORT environment variable is missing');
}

/* =========================
   CORS CONFIG
========================= */
const allowedOrigins =
  process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / health checks
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

/* =========================
   MIDDLEWARE
========================= */
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   ROUTES
========================= */
app.use('/api/setup', setupRoutes); // ONE-TIME DATABASE SETUP - REMOVE AFTER USE
app.use('/api/debug', debugRoutes); // DEBUG ONLY - REMOVE AFTER FIXING
app.use('/api/auth', authRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/mountains', mountainRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/culture-quest', cultureQuestRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/peer-review', peerReviewRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/* =========================
   ERROR HANDLER
========================= */
app.use(errorHandler);

/* =========================
   START SERVER
========================= */
const startServer = async () => {
  try {
    await connectDB();

    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Allowed CORS origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
