import { body, query } from 'express-validator';

const locationValidation = (field: 'body' | 'query') =>
  field === 'body'
    ? body('location')
        .trim()
        .notEmpty().withMessage('Lokasi highlight wajib diisi.')
        .isLength({ max: 100 }).withMessage('Lokasi highlight maksimal 100 karakter.')
        .matches(/^[a-z0-9-]+$/).withMessage('Lokasi hanya boleh berisi huruf kecil, angka, dan tanda hubung.')
    : query('location')
        .trim()
        .notEmpty().withMessage('Parameter location wajib diisi.')
        .isLength({ max: 100 }).withMessage('Lokasi highlight maksimal 100 karakter.')
        .matches(/^[a-z0-9-]+$/).withMessage('Lokasi hanya boleh berisi huruf kecil, angka, dan tanda hubung.');

export const publicHighlightValidation = [locationValidation('query')];

export const createHighlightValidation = [
  body('animal_id')
    .notEmpty().withMessage('animal_id wajib diisi.')
    .isInt({ min: 1 }).withMessage('animal_id harus berupa angka positif.'),
  locationValidation('body'),
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active harus berupa boolean.'),
  body('priority')
    .optional()
    .isInt().withMessage('priority harus berupa angka.'),
];

export const updateHighlightValidation = [
  body('animal_id')
    .optional()
    .isInt({ min: 1 }).withMessage('animal_id harus berupa angka positif.'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Lokasi highlight maksimal 100 karakter.')
    .matches(/^[a-z0-9-]+$/).withMessage('Lokasi hanya boleh berisi huruf kecil, angka, dan tanda hubung.'),
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active harus berupa boolean.'),
  body('priority')
    .optional()
    .isInt().withMessage('priority harus berupa angka.'),
];
