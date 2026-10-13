import { Router } from 'express';
import {
  getPublicCategories,
  getPublicCategoryByIdOrSlug,
} from './categories.public.controller';

const router = Router();

// GET /api/categories
router.get('/', getPublicCategories);

// GET /api/categories/:identifier (id atau slug)
router.get('/:identifier', getPublicCategoryByIdOrSlug);

export default router;
