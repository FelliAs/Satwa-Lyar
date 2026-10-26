import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';
import { getActivityLogs } from './logs.controller';

const router = Router();

router.get('/', authenticate, requireAdmin, getActivityLogs);

export default router;
