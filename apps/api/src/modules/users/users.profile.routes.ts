import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from './users.profile.controller';
import {
  updateProfileValidation,
  changePasswordValidation,
} from '../auth/auth.validation';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Semua rute profil memerlukan autentikasi user
router.use(authenticate);

// GET /api/users/profile
router.get('/profile', getUserProfile);

// PUT /api/users/profile
router.put('/profile', updateProfileValidation, validate, updateUserProfile);

// PUT /api/users/password
router.put('/password', changePasswordValidation, validate, changeUserPassword);

export default router;
