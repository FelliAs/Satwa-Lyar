import { body } from 'express-validator';

const VALID_CONSERVATION_STATUS = [
  'EX',   // Extinct
  'EW',   // Extinct in the Wild
  'CR',   // Critically Endangered
  'EN',   // Endangered
  'VU',   // Vulnerable
  'NT',   // Near Threatened
  'LC',   // Least Concern
  'DD',   // Data Deficient
  'NE',   // Not Evaluated
];

export const createAnimalValidation = [
  body('category_id')
    .notEmpty().withMessage('Kategori wajib dipilih.')
    .isInt({ min: 1 }).withMessage('category_id harus berupa angka positif.'),
  body('name')
    .notEmpty().withMessage('Nama fauna wajib diisi.')
    .isLength({ max: 255 }).withMessage('Nama maksimal 255 karakter.'),
  body('scientific_name')
    .optional()
    .isLength({ max: 255 }).withMessage('Nama ilmiah maksimal 255 karakter.'),
  body('description')
    .optional()
    .isLength({ max: 5000 }).withMessage('Deskripsi maksimal 5000 karakter.'),
  body('physical_traits')
    .optional()
    .isLength({ max: 2000 }).withMessage('Ciri fisik maksimal 2000 karakter.'),
  body('habitat')
    .optional()
    .isLength({ max: 1000 }).withMessage('Habitat maksimal 1000 karakter.'),
  body('food')
    .optional()
    .isLength({ max: 1000 }).withMessage('Makanan maksimal 1000 karakter.'),
  body('conservation_status')
    .optional()
    .isIn(VALID_CONSERVATION_STATUS)
    .withMessage(`Status konservasi harus salah satu dari: ${VALID_CONSERVATION_STATUS.join(', ')}`),
];

export const updateAnimalValidation = [
  body('category_id')
    .optional()
    .isInt({ min: 1 }).withMessage('category_id harus berupa angka positif.'),
  body('name')
    .optional()
    .isLength({ max: 255 }).withMessage('Nama maksimal 255 karakter.'),
  body('scientific_name')
    .optional()
    .isLength({ max: 255 }).withMessage('Nama ilmiah maksimal 255 karakter.'),
  body('description')
    .optional()
    .isLength({ max: 5000 }).withMessage('Deskripsi maksimal 5000 karakter.'),
  body('physical_traits')
    .optional()
    .isLength({ max: 2000 }).withMessage('Ciri fisik maksimal 2000 karakter.'),
  body('habitat')
    .optional()
    .isLength({ max: 1000 }).withMessage('Habitat maksimal 1000 karakter.'),
  body('food')
    .optional()
    .isLength({ max: 1000 }).withMessage('Makanan maksimal 1000 karakter.'),
  body('conservation_status')
    .optional()
    .isIn(VALID_CONSERVATION_STATUS)
    .withMessage(`Status konservasi harus salah satu dari: ${VALID_CONSERVATION_STATUS.join(', ')}`),
];
