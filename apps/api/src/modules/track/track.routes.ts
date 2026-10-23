import { Router } from 'express';
import { trackPageView } from './track.controller';

const router = Router();

// POST /api/track/page-view
router.post('/page-view', trackPageView);

export default router;
