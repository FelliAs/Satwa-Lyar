import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from './categories.controller';
import {
  createCategoryValidation,
  updateCategoryValidation,
} from './categories.validation';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';

const router = Router();

// Semua route categories admin memerlukan authentication + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/categories
router.get('/', getAllCategories);

// GET /api/admin/categories/:id
router.get('/:id', getCategoryById);

// POST /api/admin/categories
router.post('/', createCategoryValidation, validate, createCategory);

// PUT /api/admin/categories/:id
router.put('/:id', updateCategoryValidation, validate, updateCategory);

// DELETE /api/admin/categories/:id
router.delete('/:id', deleteCategory);

export default router;
