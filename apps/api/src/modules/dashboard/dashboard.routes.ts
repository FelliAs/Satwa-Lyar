import { Router } from 'express';
import { getDashboardStats } from './dashboard.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';

const router = Router();

// GET /api/admin/dashboard
router.get('/', authenticate, requireAdmin, getDashboardStats);

export default router;
