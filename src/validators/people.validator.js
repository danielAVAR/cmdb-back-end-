import { body, param } from 'express-validator';

export const personIdValidator = [param('id').isInt({ min: 1 })];
export const movieIdParamValidator = [param('movieId').isInt({ min: 1 })];

export const actorInputValidator = [
  body('actorName').trim().isLength({ min: 1, max: 150 }),
  body('biography').optional({ nullable: true }).isString().isLength({ max: 500 }),
  body('birthdate').optional({ nullable: true }).isISO8601({ strict: true, strictSeparator: true }),
];

export const actorUpdateValidator = [
  ...personIdValidator,
  body().custom((value) => ['actorName', 'biography', 'birthdate'].some((field) => value[field] !== undefined)),
  body('actorName').optional().trim().isLength({ min: 1, max: 150 }),
  body('biography').optional({ nullable: true }).isString().isLength({ max: 500 }),
  body('birthdate').optional({ nullable: true }).isISO8601({ strict: true, strictSeparator: true }),
];

export const directorInputValidator = [
  body('directorName').trim().isLength({ min: 1, max: 150 }),
  body('biography').optional({ nullable: true }).isString().isLength({ max: 500 }),
];

export const directorUpdateValidator = [
  ...personIdValidator,
  body().custom((value) => ['directorName', 'biography'].some((field) => value[field] !== undefined)),
  body('directorName').optional().trim().isLength({ min: 1, max: 150 }),
  body('biography').optional({ nullable: true }).isString().isLength({ max: 500 }),
];

export const actorLinksValidator = [
  ...movieIdParamValidator,
  body('actorIds').isArray(),
  body('actorIds.*').isInt({ min: 1 }),
];

export const directorLinksValidator = [
  ...movieIdParamValidator,
  body('directorIds').isArray(),
  body('directorIds.*').isInt({ min: 1 }),
];
