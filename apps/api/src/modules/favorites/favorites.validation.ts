import { param, body } from 'express-validator';

export const favoriteParamValidation = [
  param('animalId')
    .isInt({ min: 1 })
    .withMessage('ID fauna harus berupa angka positif.'),
];

export const addFavoriteBodyValidation = [
  body('animal_id')
    .isInt({ min: 1 })
    .withMessage('animal_id harus berupa angka positif.'),
];
