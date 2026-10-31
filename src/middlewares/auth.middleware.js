// carga el .env antes de leer JWT_SECRET
import 'dotenv/config';
import passport from 'passport';
import { ApiError } from './error.middleware.js';

// verifica el token y responde 401 si falta o no es valido
const auth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
        return next(err);
    }

    if (!user) {
        return next(new ApiError(401, 'unauthorized'));
    }

    req.user = user;
    next();
})(req, res, next);
};

export default auth;
