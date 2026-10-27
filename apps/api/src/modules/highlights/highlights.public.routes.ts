import { Router } from 'express';
import { validate } from '../../middleware/validation.middleware';
import { getPublicHighlights, validatePublicHighlightLocation } from './highlights.public.controller';
import { publicHighlightValidation } from './highlights.validation';

const router = Router();

router.get('/', publicHighlightValidation, validate, validatePublicHighlightLocation, getPublicHighlights);

export default router;
