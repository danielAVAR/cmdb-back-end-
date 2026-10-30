// carga el .env antes de leer APP_PORT
import 'dotenv/config';
import { createRequire } from 'node:module';

// la version de la documentacion sale de package.json (HU-31)
const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

const port = process.env.APP_PORT || 3000;

// especificacion OpenAPI 3 base
// las rutas se agregan en "paths" con rutas relativas a "servers" (por ejemplo "/auth/login")
const swaggerSpec = {
    openapi: '3.0.3',
    info: {
        title: 'CMDB API',
        version,
        description: 'API para registrar, calificar y rankear peliculas, animes y series.',
    },
    servers: [
        { url: `http://localhost:${port}/api/v1`, description: 'Desarrollo local' },
    ],
    tags: [],
    paths: {},
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
};

export default swaggerSpec;