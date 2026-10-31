import { ApiError } from '../utils/apiError.js';
export { ApiError };

// manejador centralizado de errores
// express lo reconoce como manejador de errores por tener 4 parametros
export const errorHandler = (err, req, res, next) => {
  // Si la respuesta ya empezó, Express debe terminar el manejo del error.
  if (res.headersSent) return next(err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, status: 409, message: 'resource already exists', errors: [] });
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ success: false, status: 409, message: 'resource is in use', errors: [] });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ success: false, status: 400, message: 'referenced resource does not exist', errors: [] });
  }

  const status = err.status || err.statusCode || 500;
  const isServerError = status >= 500;

  // Los detalles técnicos de errores internos se registran solo en el servidor.
  if (isServerError) {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    status,
    message: isServerError ? 'internal server error' : err.message,
    errors: err.errors || [],
  });
};
