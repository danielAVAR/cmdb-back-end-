import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

// firma un token con el payload recibido por parametro
// no sabe de usuarios ni de base de datos: quien llama decide que va en el payload
export const signToken = (payload) => {
    return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
    });
};