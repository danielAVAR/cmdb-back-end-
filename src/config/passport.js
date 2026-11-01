import passport from 'passport';
import passportJwt from 'passport-jwt';
import { jwtConfig } from './jwt.js';

// passport-jwt es CommonJS: se importa por defecto y se desestructura
const { Strategy, ExtractJwt } = passportJwt;

passport.use(
  new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfig.secret,
    },
    (payload, done) => {
      // req.user debe reflejar las columnas del esquema actual.
      done(null, { id: Number(payload.sub), administrator: Boolean(payload.administrator) });
    }
  )
);

export default passport;
