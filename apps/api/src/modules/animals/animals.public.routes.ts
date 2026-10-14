import { Router } from 'express';
import {
  getPublicAnimals,
  getPublicAnimalById,
} from './animals.public.controller';
import { optionalAuthenticate } from '../../middleware/auth.middleware';

const router = Router();

// Middleware opsional auth: jika user login, is_favorite akan terisi secara otomatis
router.use(optionalAuthenticate);

// GET /api/animals
router.get('/', getPublicAnimals);

// GET /api/animals/:id
router.get('/:id', getPublicAnimalById);

export default router;
