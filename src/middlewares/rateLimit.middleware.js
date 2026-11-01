import rateLimit from 'express-rate-limit';
import { ApiError } from './error.middleware.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

const createLimiter = (limit, options = {}) => rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, next) => next(new ApiError(429, 'Too many requests; try again later')),
  ...options,
});

// global ceiling per IP; a catalog page makes several requests
export const general = createLimiter(300);

// only failed logins count, so a user who signs in correctly is never blocked
export const loginLimiter = createLimiter(10, { skipSuccessfulRequests: true });

// account creation is rare, so it gets a longer window
export const registerLimiter = createLimiter(20, { windowMs: ONE_HOUR });
