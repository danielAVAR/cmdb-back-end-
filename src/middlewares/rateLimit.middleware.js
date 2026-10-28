import rateLimit from 'express-rate-limit';
import { ApiError } from './error.middleware.js';

// limita las peticiones por ip para evitar abusos
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // usa el mismo formato de error que el resto de la api
    handler: (req, res, next) => {
    next(new ApiError(429, 'too many requests, try again later'));
},
});

export default limiter;