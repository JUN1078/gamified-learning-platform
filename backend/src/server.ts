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

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/mountains', mountainRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/culture-quest', cultureQuestRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  });
};

startServer();

export default app;
