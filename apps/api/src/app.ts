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

// Routes Admin
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import animalsRoutes from './modules/animals/animals.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import quizRoutes from './modules/quiz/quiz.routes';
import usersRoutes from './modules/users/users.routes';
import logsRoutes from './modules/logs/logs.routes';
import highlightsRoutes from './modules/highlights/highlights.routes';

import { errorHandler, notFoundHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();

// ================================
// SECURITY MIDDLEWARE
// ================================

// Helmet: set HTTP security headers
app.use(helmet());

// CORS: izinkan request dari frontend Next.js
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

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

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'SATWA LYAR API berjalan dengan baik.',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ================================
// ROUTES: PUBLIK & USER
// ================================

// Auth (register, login, logout, me)
app.use('/api/auth', authLimiter, authRoutes);

// User Profile (view profile, update profile, change password)
app.use('/api/users', userProfileRoutes);

// Public Animals (browse, search, filter zona & konservasi, detail satwa)
app.use('/api/animals', animalsPublicRoutes);

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
