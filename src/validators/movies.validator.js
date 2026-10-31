import { body, param, query } from 'express-validator';

export const movieIdValidator = [param('id').isInt({ min: 1 }).withMessage('id must be a positive integer')];
export const listMoviesValidator = [
  query('categoryId').optional().isInt({ min: 1 }),
  query('sort').optional().isIn(['ranking', 'popular', 'newest', 'title']),
];
export const createMovieValidator = [
  body('movieName').trim().isLength({ min: 1, max: 100 }),
  body('overview').trim().isLength({ min: 1, max: 500 }),
  body('releaseYear').isInt({ min: 1, max: 65535 }),
  body('imageUrl').optional({ nullable: true }).isURL({ protocols: ['http', 'https'], require_protocol: true }).isLength({ max: 500 }),
  body('runtime').optional({ nullable: true }).isInt({ min: 1, max: 65535 }),
  body('budget').optional({ nullable: true }).isInt({ min: 0 }),
  body('grossWorldwide').optional({ nullable: true }).isInt({ min: 0 }),
  body('categoryIds').isArray({ min: 1 }).withMessage('at least one category is required'),
  body('categoryIds.*').isInt({ min: 1 }),
];
export const updateMovieValidator = [
  ...movieIdValidator,
  body().custom((value) => Object.keys(value).some((key) => [
    'movieName', 'overview', 'releaseYear', 'imageUrl', 'runtime', 'budget', 'grossWorldwide', 'categoryIds',
  ].includes(key))).withMessage('at least one editable movie field is required'),
  body('movieName').optional().trim().isLength({ min: 1, max: 100 }),
  body('overview').optional().trim().isLength({ min: 1, max: 500 }),
  body('releaseYear').optional().isInt({ min: 1, max: 65535 }),
  body('imageUrl').optional({ nullable: true }).isURL({ protocols: ['http', 'https'], require_protocol: true }).isLength({ max: 500 }),
  body('runtime').optional({ nullable: true }).isInt({ min: 1, max: 65535 }),
  body('budget').optional({ nullable: true }).isInt({ min: 0 }),
  body('grossWorldwide').optional({ nullable: true }).isInt({ min: 0 }),
  body('categoryIds').optional().isArray({ min: 1 }),
  body('categoryIds.*').optional().isInt({ min: 1 }),
];
