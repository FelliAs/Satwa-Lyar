import { body } from 'express-validator';

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Format email tidak valid.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password wajib diisi.')
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter.'),
];
