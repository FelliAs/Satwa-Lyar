import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from './users.controller';
import { createUserValidation, updateUserValidation } from './users.validation';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';

const router = Router();

router.use(authenticate, requireAdmin);

// GET /api/admin/users?page=1&limit=10&search=&role=
router.get('/', getAllUsers);

// GET /api/admin/users/:id
router.get('/:id', getUserById);

// POST /api/admin/users
router.post('/', createUserValidation, validate, createUser);

// PUT /api/admin/users/:id
router.put('/:id', updateUserValidation, validate, updateUser);

// DELETE /api/admin/users/:id
router.delete('/:id', deleteUser);

export default router;
