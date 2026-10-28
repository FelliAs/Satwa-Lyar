import { Router } from 'express';
import { login, logout, getMe } from './auth.controller';
import { loginValidation } from './auth.validation';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// POST /api/auth/login (khusus admin)
router.post('/login', loginValidation, validate, login);

// POST /api/auth/logout
router.post('/logout', authenticate, logout);

// GET /api/auth/me (identitas aktif: admin atau guest)
router.get('/me', authenticate, getMe);

export default router;
