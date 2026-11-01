import { validationResult } from 'express-validator';
import { ApiError } from './error.middleware.js';

// revisa los resultados de express-validator y responde 400 si hay errores
const validate = (req, res, next) => {
const result = validationResult(req);

if (result.isEmpty()) {
    return next();
}

// convierte cada error de validacion en un objeto con campo y mensaje
const errors = result.array().map((err) => ({
    field: err.path,
    message: err.msg,
}));

next(new ApiError(400, 'validation error', errors));
};

export default validate;