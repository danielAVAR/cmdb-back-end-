// carga el .env antes de leer JWT_SECRET
import 'dotenv/config';
import passport from 'passport';
import pkg from 'passport-jwt';
import { ApiError } from './error.middleware.js';

// passport-jwt es de tipo commonjs, por eso se desestructura desde el paquete
const { Strategy: JwtStrategy, ExtractJwt } = pkg;

// configuracion de la estrategia jwt
// el secreto sale de la variable JWT_SECRET del archivo .env
passport.use(
    new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
    },
    (payload, done) => {
        // La identidad del token se normaliza para usar req.user.id.
        return done(null, { id: Number(payload.sub), administrator: Boolean(payload.administrator) });
    }
)
);

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
