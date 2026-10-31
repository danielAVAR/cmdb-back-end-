import { body, param } from 'express-validator';

export const categoryIdValidator = [param('id').isInt({ min: 1 }).withMessage('id must be a positive integer')];
export const createCategoryValidator = [
  body('categoryName').trim().isLength({ min: 1, max: 80 }).withMessage('categoryName must be 1 to 80 characters'),
];
export const updateCategoryValidator = [
  ...categoryIdValidator,
  body('categoryName').trim().isLength({ min: 1, max: 80 }).withMessage('categoryName must be 1 to 80 characters'),
];
