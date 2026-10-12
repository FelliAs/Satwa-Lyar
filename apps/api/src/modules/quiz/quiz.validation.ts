import { body } from 'express-validator';

const VALID_ANSWERS = ['A', 'B', 'C', 'D'];

const questionBodyValidation = [
  body('question_text')
    .notEmpty().withMessage('Teks pertanyaan wajib diisi.')
    .isLength({ max: 1000 }).withMessage('Pertanyaan maksimal 1000 karakter.'),
  body('option_a').notEmpty().withMessage('Opsi A wajib diisi.').isLength({ max: 500 }),
  body('option_b').notEmpty().withMessage('Opsi B wajib diisi.').isLength({ max: 500 }),
  body('option_c').notEmpty().withMessage('Opsi C wajib diisi.').isLength({ max: 500 }),
  body('option_d').notEmpty().withMessage('Opsi D wajib diisi.').isLength({ max: 500 }),
  body('correct_answer')
    .notEmpty().withMessage('Jawaban benar wajib diisi.')
    .isIn(VALID_ANSWERS).withMessage('Jawaban benar harus A, B, C, atau D.'),
  body('order_num')
    .optional()
    .isInt({ min: 1 }).withMessage('Urutan pertanyaan harus angka positif.'),
];

export const createQuizValidation = [
  body('title')
    .notEmpty().withMessage('Judul quiz wajib diisi.')
    .isLength({ max: 255 }).withMessage('Judul maksimal 255 karakter.'),
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Deskripsi maksimal 1000 karakter.'),
  body('category_id')
    .optional()
    .isInt({ min: 1 }).withMessage('category_id harus berupa angka positif.'),
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active harus berupa boolean.'),
  // Validasi array pertanyaan (opsional saat create)
  body('questions')
    .optional()
    .isArray().withMessage('questions harus berupa array.'),
  body('questions.*.question_text')
    .if(body('questions').exists())
    .notEmpty().withMessage('Teks pertanyaan tidak boleh kosong.'),
  body('questions.*.option_a').optional().isLength({ max: 500 }),
  body('questions.*.option_b').optional().isLength({ max: 500 }),
  body('questions.*.option_c').optional().isLength({ max: 500 }),
  body('questions.*.option_d').optional().isLength({ max: 500 }),
  body('questions.*.correct_answer')
    .if(body('questions').exists())
    .isIn(VALID_ANSWERS).withMessage('Jawaban benar harus A, B, C, atau D.'),
];

export const updateQuizValidation = [
  body('title')
    .optional()
    .isLength({ max: 255 }).withMessage('Judul maksimal 255 karakter.'),
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Deskripsi maksimal 1000 karakter.'),
  body('category_id')
    .optional()
    .isInt({ min: 1 }).withMessage('category_id harus berupa angka positif.'),
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active harus berupa boolean.'),
];

export const questionValidation = questionBodyValidation;
