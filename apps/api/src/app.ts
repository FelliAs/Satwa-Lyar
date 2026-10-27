import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Routes Publik & User
import authRoutes from './modules/auth/auth.routes';
import animalsPublicRoutes from './modules/animals/animals.public.routes';
import categoriesPublicRoutes from './modules/categories/categories.public.routes';
import favoritesRoutes from './modules/favorites/favorites.routes';
import quizUserRoutes from './modules/quiz/quiz.user.routes';
import userProfileRoutes from './modules/users/users.profile.routes';
import trackRoutes from './modules/track/track.routes';
import highlightsPublicRoutes from './modules/highlights/highlights.public.routes';

// Routes Admin
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import animalsRoutes from './modules/animals/animals.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import quizRoutes from './modules/quiz/quiz.routes';
import usersRoutes from './modules/users/users.routes';
import logsRoutes from './modules/logs/logs.routes';
import highlightsRoutes from './modules/highlights/highlights.routes';

import { requestId } from './middleware/request-id.middleware';
import { guestContext } from './middleware/guest-context.middleware';
import { activityLogger } from './middleware/activity-logger.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import pool from './config/database';

dotenv.config();

const app = express();

// Di belakang proxy Vercel, agar req.ip berisi IP client sebenarnya.
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// ================================
// REQUEST ID
// ================================
app.use(requestId);

// ================================
// SECURITY MIDDLEWARE
// ================================

// Helmet: set HTTP security headers
app.use(helmet());

// CORS: izinkan request dari frontend Next.js
app.use(
  cors({
    origin: (origin, callback) => {
      // Request tanpa Origin (mis. curl, health check) tetap diizinkan.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  })
);

// Rate Limiting: global limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak request. Coba lagi dalam 15 menit.',
  },
});
app.use('/api', globalLimiter);

// Rate Limiting: lebih ketat untuk auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 15,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan autentikasi. Coba lagi dalam 15 menit.',
  },
});

// ================================
// BODY PARSER
// ================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ================================
// LOGGER
// ================================
morgan.token('request-id', (req) => (req as any).requestId || '-');
morgan.token('actor', (req) => (req as any).user?.public_id || '-');

const logFormat = ':method :url :status :response-time ms - :request-id :actor';

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan(logFormat));
}

// ================================
// GUEST CONTEXT
// Identitas Guest dibuat otomatis, admin memakai token JWT.
// ================================
app.use(guestContext);

// ================================
// ACTIVITY LOGGER
// ================================
app.use(activityLogger);

// ================================
// ROOT & HEALTH CHECK
// ================================
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    name: 'SATWA LYAR API',
    message: 'Backend API Satwa Lyar aktif.',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/login',
      admin: '/api/admin',
    },
  });
});

app.get('/api/health', async (_req, res) => {
  let database: 'ok' | 'error' = 'ok';

  try {
    await pool.query('SELECT 1');
  } catch {
    database = 'error';
  }

  res.status(database === 'ok' ? 200 : 503).json({
    success: database === 'ok',
    message: 'SATWA LYAR API berjalan dengan baik.',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    database,
  });
});

// ================================
// ROUTES: PUBLIK & USER
// ================================

// Auth (login admin, logout, session)
app.use('/api/auth', authLimiter, authRoutes);

// Tracking kunjungan halaman
app.use('/api/track', trackRoutes);

// User Profile (view profile, update profile, change password)
app.use('/api/users', userProfileRoutes);

// Public Animals (browse, search, filter zona & konservasi, detail satwa)
app.use('/api/animals', animalsPublicRoutes);

// Public animal highlights for landing page and destination zones
app.use('/api/highlights', highlightsPublicRoutes);

// Public Categories (4 zona fauna: Air Tawar, Serangga, Reptil, Burung)
app.use('/api/categories', categoriesPublicRoutes);

// User Favorites (list, add, remove, check favorite fauna)
app.use('/api/favorites', favoritesRoutes);

// User Quizzes (list active quizzes, take quiz questions, submit answers, history)
app.use('/api/quiz', quizUserRoutes);

// ================================
// ROUTES: ADMIN (PROTECTED)
// ================================
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/animals', animalsRoutes);
app.use('/api/admin/categories', categoriesRoutes);
app.use('/api/admin/quiz', quizRoutes);
app.use('/api/admin/users', usersRoutes);
app.use('/api/admin/logs', logsRoutes);
app.use('/api/admin/highlights', highlightsRoutes);

// ================================
// ERROR HANDLERS
// ================================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
