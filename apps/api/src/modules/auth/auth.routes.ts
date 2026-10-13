import { Router } from 'express';
import { register, login, logout, getMe } from './auth.controller';
import { registerValidation, loginValidation } from './auth.validation';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// POST /api/auth/register
router.post('/register', registerValidation, validate, register);

// POST /api/auth/login
router.post('/login', loginValidation, validate, login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me (perlu token)
router.get('/me', authenticate, getMe);

export default router;
