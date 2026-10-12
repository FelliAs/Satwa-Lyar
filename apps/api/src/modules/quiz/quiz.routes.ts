import { Router } from 'express';
import {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from './quiz.controller';
import {
  createQuizValidation,
  updateQuizValidation,
  questionValidation,
} from './quiz.validation';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';

const router = Router();

router.use(authenticate, requireAdmin);

// Quiz routes
router.get('/', getAllQuizzes);
router.get('/:id', getQuizById);
router.post('/', createQuizValidation, validate, createQuiz);
router.put('/:id', updateQuizValidation, validate, updateQuiz);
router.delete('/:id', deleteQuiz);

// Question routes (nested di bawah quiz)
router.post('/:id/questions', questionValidation, validate, addQuestion);
router.put('/:id/questions/:qid', questionValidation, validate, updateQuestion);
router.delete('/:id/questions/:qid', deleteQuestion);

export default router;
