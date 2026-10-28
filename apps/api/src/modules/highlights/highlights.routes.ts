import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';
import { getHighlights, createHighlight, updateHighlight, deleteHighlight } from './highlights.controller';

const router = Router();
router.use(authenticate, requireAdmin);
router.get('/', getHighlights);
router.post('/', createHighlight);
router.patch('/:id', updateHighlight);
router.delete('/:id', deleteHighlight);
export default router;
