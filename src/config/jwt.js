// carga el .env antes de leer las variables
import 'dotenv/config';

const secret = process.env.JWT_SECRET;

// sin secreto no se pueden firmar ni verificar tokens, asi que el arranque se detiene
if (!secret) {
    throw new Error('JWT_SECRET no esta definido en el archivo .env');
}

// JWT_EXPIRES_IN acepta "1h", "7d", etc. Si solo trae numeros se toma como segundos
const rawExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
const expiresIn = /^\d+$/.test(rawExpiresIn) ? Number(rawExpiresIn) : rawExpiresIn;

export const jwtConfig = {
    secret,
    expiresIn,
};