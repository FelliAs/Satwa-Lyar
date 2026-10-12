import { body } from 'express-validator';

export const createCategoryValidation = [
  body('name')
    .notEmpty().withMessage('Nama kategori wajib diisi.')
    .isLength({ max: 100 }).withMessage('Nama maksimal 100 karakter.'),
  body('slug')
    .notEmpty().withMessage('Slug wajib diisi.')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug hanya boleh huruf kecil, angka, dan tanda hubung.')
    .isLength({ max: 100 }).withMessage('Slug maksimal 100 karakter.'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Deskripsi maksimal 500 karakter.'),
  body('icon')
    .optional()
    .isLength({ max: 255 }).withMessage('Icon maksimal 255 karakter.'),
];

export const updateCategoryValidation = [
  body('name')
    .optional()
    .isLength({ max: 100 }).withMessage('Nama maksimal 100 karakter.'),
  body('slug')
    .optional()
    .matches(/^[a-z0-9-]+$/).withMessage('Slug hanya boleh huruf kecil, angka, dan tanda hubung.')
    .isLength({ max: 100 }).withMessage('Slug maksimal 100 karakter.'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Deskripsi maksimal 500 karakter.'),
  body('icon')
    .optional()
    .isLength({ max: 255 }).withMessage('Icon maksimal 255 karakter.'),
];
