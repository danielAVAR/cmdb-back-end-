import { body } from 'express-validator';

export const registerValidator = [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('username must be 3 to 50 characters'),
  body('email').trim().isEmail().withMessage('email must be valid').isLength({ max: 120 }),
  body('password').isString().isLength({ min: 8, max: 72 }).withMessage('password must be 8 to 72 characters'),
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('email must be valid'),
  body('password').isString().notEmpty().withMessage('password is required'),
];
