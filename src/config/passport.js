import 'dotenv/config';
import passport from 'passport';
import passportJwt from 'passport-jwt';

// passport-jwt es CommonJS: se importa por defecto y se desestructura
const { Strategy, ExtractJwt } = passportJwt;

passport.use(
  new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    (payload, done) => {
      // req.user debe reflejar las columnas del esquema actual.
      done(null, { id: Number(payload.sub), administrator: Boolean(payload.administrator) });
    }
  )
);

export default passport;
