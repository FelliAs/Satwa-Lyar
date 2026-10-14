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

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nama lengkap wajib diisi.')
    .isLength({ min: 2, max: 255 })
    .withMessage('Nama harus antara 2 - 255 karakter.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Format email tidak valid.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password wajib diisi.')
    .isLength({ min: 8 })
    .withMessage('Password minimal 8 karakter.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka.'),
];

export const updateProfileValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nama lengkap wajib diisi.')
    .isLength({ min: 2, max: 255 })
    .withMessage('Nama harus antara 2 - 255 karakter.'),
];

export const changePasswordValidation = [
  body('current_password')
    .notEmpty()
    .withMessage('Password saat ini wajib diisi.'),
  body('new_password')
    .notEmpty()
    .withMessage('Password baru wajib diisi.')
    .isLength({ min: 8 })
    .withMessage('Password baru minimal 8 karakter.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password baru harus mengandung huruf besar, huruf kecil, dan angka.'),
];
