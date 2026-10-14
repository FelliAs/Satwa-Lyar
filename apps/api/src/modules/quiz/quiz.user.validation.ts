import { body, param } from 'express-validator';

export const submitQuizValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID quiz harus berupa angka positif.'),
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Jawaban kuis harus berupa array dan tidak boleh kosong.'),
  body('answers.*.question_id')
    .isInt({ min: 1 })
    .withMessage('question_id harus berupa angka positif.'),
  body('answers.*.answer')
    .isString()
    .isIn(['A', 'B', 'C', 'D', 'a', 'b', 'c', 'd'])
    .withMessage('Pilihan jawaban harus salah satu dari A, B, C, atau D.'),
];
