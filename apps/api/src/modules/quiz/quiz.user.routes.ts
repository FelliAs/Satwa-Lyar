import { Router } from 'express';
import {
  getPublicQuizzes,
  getPublicQuizById,
  submitQuizAnswers,
  getUserQuizHistory,
  getUserQuizResultById,
} from './quiz.user.controller';
import { submitQuizValidation } from './quiz.user.validation';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/quiz (Public: daftar quiz aktif)
router.get('/', getPublicQuizzes);

// GET /api/quiz/history (User: riwayat kuis user login)
router.get('/history', authenticate, getUserQuizHistory);

// GET /api/quiz/results/:id (User: detail hasil kuis tertentu)
router.get('/results/:id', authenticate, getUserQuizResultById);

// GET /api/quiz/:id (Public: soal kuis tanpa jawaban benar)
router.get('/:id', getPublicQuizById);

// POST /api/quiz/:id/submit (User: kirim jawaban kuis dan dapatkan nilai)
router.post('/:id/submit', authenticate, submitQuizValidation, validate, submitQuizAnswers);

export default router;
