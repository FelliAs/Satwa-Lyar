import { body } from 'express-validator';

export const createUserValidation = [
  body('name')
    .notEmpty().withMessage('Nama wajib diisi.')
    .isLength({ max: 255 }).withMessage('Nama maksimal 255 karakter.'),
  body('email')
    .isEmail().withMessage('Format email tidak valid.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password wajib diisi.')
    .isLength({ min: 8 }).withMessage('Password minimal 8 karakter.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka.'),
  body('role')
    .optional()
    .isIn(['admin', 'user']).withMessage('Role harus admin atau user.'),
];

export const updateUserValidation = [
  body('name')
    .optional()
    .isLength({ max: 255 }).withMessage('Nama maksimal 255 karakter.'),
  body('email')
    .optional()
    .isEmail().withMessage('Format email tidak valid.')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 8 }).withMessage('Password minimal 8 karakter.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka.'),
  body('role')
    .optional()
    .isIn(['admin', 'user']).withMessage('Role harus admin atau user.'),
];
