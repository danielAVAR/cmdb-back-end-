import rateLimit from 'express-rate-limit';
import { ApiError } from './error.middleware.js';

const createLimiter = (limit) => rateLimit({
  windowMs: 15 * 60 * 1000,
  limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, next) => next(new ApiError(429, 'Too many requests; try again later')),
});

export const general = createLimiter(100);
export const authLimiter = createLimiter(10);
