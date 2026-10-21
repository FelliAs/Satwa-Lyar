import { Router } from 'express';
import { getActivityLogs, getActivityLogSummary } from './logs.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';

const router = Router();

// Endpoint log hanya boleh diakses admin
router.use(authenticate, requireAdmin);

// GET /api/admin/logs?page=1&limit=20&event_type=&actor_type=&actor_public_id=&action=&endpoint=&from=&to=&q=
router.get('/', getActivityLogs);

// GET /api/admin/logs/summary?days=7
router.get('/summary', getActivityLogSummary);

export default router;
