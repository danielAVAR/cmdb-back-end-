// clase para lanzar errores http desde controladores y servicios
export class ApiError extends Error {
    constructor(status, message, errors = []) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
}

// manejador centralizado de errores
// express lo reconoce como manejador de errores por tener 4 parametros
export const errorHandler = (err, req, res, next) => {
    // si la respuesta ya empezo no se puede enviar otra
    if (res.headersSent) {
    return next(err);
    }

// si no viene un estado definido se asume error interno
    const status = err.status || err.statusCode || 500;
const isServerError = status >= 500;

// el detalle tecnico solo se registra en el servidor
if (isServerError) {
    console.error(err);
}

    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, status: 409, message: 'resource already exists', errors: [] });
    }
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ success: false, status: 409, message: 'resource is in use', errors: [] });
    }

    res.status(status).json({
    success: false,
    status,
        message: isServerError ? 'internal server error' : err.message,
    errors: err.errors || [],
    });
};
