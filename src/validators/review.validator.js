import { body, param, query } from 'express-validator';
import { REACTION_TYPES } from '../utils/constants.js';

export const reviewIdValidator = [param('id').isInt({ min: 1 }).withMessage('id must be a positive integer')];
export const listReviewsValidator = [query('movieId').optional().isInt({ min: 1 })];
export const createReviewValidator = [
  body('movieId').isInt({ min: 1 }),
  body('title').trim().isLength({ min: 1, max: 150 }),
  body('comment').trim().isLength({ min: 1, max: 500 }),
  body('rating').isInt({ min: 1, max: 10 }),
];
export const updateReviewValidator = [
  ...reviewIdValidator,
  body().custom((value) => ['title', 'comment', 'rating'].some((field) => value[field] !== undefined))
    .withMessage('at least one editable review field is required'),
  body('title').optional().trim().isLength({ min: 1, max: 150 }),
  body('comment').optional().trim().isLength({ min: 1, max: 500 }),
  body('rating').optional().isInt({ min: 1, max: 10 }),
];
export const reactionValidator = [
  ...reviewIdValidator,
  body('reaction').isIn(Object.values(REACTION_TYPES)).withMessage('reaction must be like or dislike'),
];
