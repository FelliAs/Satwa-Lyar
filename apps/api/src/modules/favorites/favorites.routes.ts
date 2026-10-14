import { Router } from 'express';
import {
  getUserFavorites,
  addFavorite,
  removeFavorite,
  checkFavoriteStatus,
} from './favorites.controller';
import {
  favoriteParamValidation,
  addFavoriteBodyValidation,
} from './favorites.validation';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Semua rute favorit memerlukan user yang telah login
router.use(authenticate);

// GET /api/favorites (Daftar fauna favorit user login)
router.get('/', getUserFavorites);

// GET /api/favorites/check/:animalId (Cek apakah fauna sudah difavoritkan)
router.get('/check/:animalId', favoriteParamValidation, validate, checkFavoriteStatus);

// POST /api/favorites/:animalId (Tambah ke favorit via URL param)
router.post('/:animalId', favoriteParamValidation, validate, addFavorite);

// POST /api/favorites (Tambah ke favorit via request body { animal_id })
router.post('/', addFavoriteBodyValidation, validate, addFavorite);

// DELETE /api/favorites/:animalId (Hapus dari favorit)
router.delete('/:animalId', favoriteParamValidation, validate, removeFavorite);

export default router;
