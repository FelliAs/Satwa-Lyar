import { Router } from 'express';
import { login, getMe } from './auth.controller';
import { loginValidation } from './auth.validation';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// POST /api/auth/login
router.post('/login', loginValidation, validate, login);

// GET /api/auth/me - memerlukan token
router.get('/me', authenticate, getMe);

export default router;
