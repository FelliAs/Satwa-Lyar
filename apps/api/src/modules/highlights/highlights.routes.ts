import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  getAdminHighlights,
  createHighlight,
  updateHighlight,
  deleteHighlight,
} from './highlights.controller';
import { createHighlightValidation, updateHighlightValidation } from './highlights.validation';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/', getAdminHighlights);
router.post('/', createHighlightValidation, validate, createHighlight);
router.patch('/:id', updateHighlightValidation, validate, updateHighlight);
router.delete('/:id', deleteHighlight);

export default router;
