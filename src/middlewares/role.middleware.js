import { ApiError } from './error.middleware.js';

// revisa que el usuario tenga alguno de los roles permitidos
// responde 403 si el rol no coincide
const requireRole = (...allowedRoles) => (req, res, next) => {
if (!req.user) {
    return next(new ApiError(401, 'unauthorized'));
}

if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'forbidden'));
}

next();
};

export default requireRole;