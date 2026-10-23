import { Request, Response, NextFunction } from 'express';
import { recordActivity } from '../logs/logs.service';

/**
 * POST /api/track/page-view
 * Menerima notifikasi kunjungan halaman dari frontend.
 * Halaman dihitung sebagai page_view, bukan api_request.
 */
export const trackPageView = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const path = typeof req.body?.path === 'string' ? req.body.path.slice(0, 500) : null;
    const referrer =
      typeof req.body?.referrer === 'string' ? req.body.referrer.slice(0, 500) : null;

    await recordActivity(req, {
      event_type: 'page_view',
      action: path ? `PAGE_VIEW ${path}` : 'PAGE_VIEW',
      resource_type: 'page',
      resource_id: path,
      payload: {
        path,
        referrer,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Kunjungan tercatat.',
      request_id: req.requestId,
    });
  } catch (error) {
    next(error);
  }
};
