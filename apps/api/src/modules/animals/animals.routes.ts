import { Router } from 'express';
import multer from 'multer';
import {
  getAllAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  deleteAnimalImage,
} from './animals.controller';
import {
  createAnimalValidation,
  updateAnimalValidation,
} from './animals.validation';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';

const router = Router();

// Konfigurasi multer - menyimpan file di memory (untuk dikirim ke R2)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Max 5MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar (JPEG, PNG, WebP, GIF) yang diperbolehkan.'));
    }
  },
});

// Semua route animals admin memerlukan authentication + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/animals?page=1&limit=10&search=&category_id=
router.get('/', getAllAnimals);

// GET /api/admin/animals/:id
router.get('/:id', getAnimalById);

// POST /api/admin/animals
router.post('/', upload.single('image'), createAnimalValidation, validate, createAnimal);

// PUT /api/admin/animals/:id
router.put('/:id', upload.single('image'), updateAnimalValidation, validate, updateAnimal);

// DELETE /api/admin/animals/:id
router.delete('/:id', deleteAnimal);

// DELETE /api/admin/animals/:id/image
router.delete('/:id/image', deleteAnimalImage);

export default router;
