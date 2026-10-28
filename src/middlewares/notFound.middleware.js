import { ApiError } from './error.middleware.js';

// captura las rutas que no existen y las pasa al manejador de errores
const notFound = (req, res, next) => {
    next(new ApiError(404, `route not found: ${req.method} ${req.originalUrl}`));
};

export default notFound;