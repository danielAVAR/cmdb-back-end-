// carga el .env antes de leer APP_PORT
import 'dotenv/config';
import { apiVersion } from '../utils/version.js';


const port = process.env.APP_PORT || 3000;

const swaggerSpec = {
    openapi: '3.0.3',
    info: {
        title: 'CMDB API',
        version: apiVersion,
        description: 'API CMDB para usuarios, películas, categorías, reseñas, reacciones y ranking.',
    },
    servers: [
        { url: `http://localhost:${port}/api/v1`, description: 'Desarrollo local' },
    ],
    tags: [
        { name: 'Autenticación', description: 'Registro, login e identidad del usuario.' },
        { name: 'Categorías', description: 'Lectura pública y administración restringida.' },
        { name: 'Películas', description: 'Catálogo, propuestas y aprobación.' },
        { name: 'Reseñas', description: 'Reseñas y reacciones de usuarios.' },
        { name: 'Sistema', description: 'Información de la API.' },
    ],
    paths: {
        '/auth/register': {
            post: {
                tags: ['Autenticación'], summary: 'Registrar usuario',
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } } },
                responses: { 201: { description: 'Usuario registrado.' }, 400: { description: 'Entrada inválida.' }, 409: { description: 'Username o email ya existe.' } },
            },
        },
        '/auth/login': {
            post: {
                tags: ['Autenticación'], summary: 'Iniciar sesión',
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } } },
                responses: { 200: { description: 'JWT y usuario público.' }, 401: { description: 'Credenciales inválidas.' }, 429: { description: 'Límite de intentos alcanzado.' } },
            },
        },
        '/auth/me': {
            get: { tags: ['Autenticación'], summary: 'Consultar usuario autenticado', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Usuario actual.' }, 401: { description: 'JWT inválido o ausente.' } } },
        },
        '/categories': {
            get: { tags: ['Categorías'], summary: 'Listar categorías', responses: { 200: { description: 'Categorías disponibles.' } } },
            post: {
                tags: ['Categorías'], summary: 'Crear categoría (administrador)', security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryInput' } } } },
                responses: { 201: { description: 'Categoría creada.' }, 401: { description: 'Autenticación requerida.' }, 403: { description: 'Se requiere administrador.' }, 409: { description: 'El nombre ya existe.' } },
            },
        },
        '/categories/{id}': {
            parameters: [{ $ref: '#/components/parameters/Id' }],
            get: { tags: ['Categorías'], summary: 'Consultar categoría', responses: { 200: { description: 'Categoría.' }, 404: { description: 'No encontrada.' } } },
            put: {
                tags: ['Categorías'], summary: 'Actualizar categoría (administrador)', security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryInput' } } } },
                responses: { 200: { description: 'Categoría actualizada.' }, 403: { description: 'Se requiere administrador.' }, 404: { description: 'No encontrada.' } },
            },
            delete: { tags: ['Categorías'], summary: 'Eliminar categoría (administrador)', security: [{ bearerAuth: [] }], responses: { 204: { description: 'Eliminada.' }, 403: { description: 'Se requiere administrador.' }, 409: { description: 'La categoría está asignada a películas.' } } },
        },
        '/movies': {
            get: {
                tags: ['Películas'], summary: 'Listar películas aprobadas',
                parameters: [
                    { name: 'categoryId', in: 'query', schema: { type: 'integer', minimum: 1 } },
                    { name: 'sort', in: 'query', schema: { type: 'string', enum: ['ranking', 'popular', 'newest', 'title'], default: 'ranking' } },
                ],
                responses: { 200: { description: 'Películas aprobadas ordenadas o filtradas.' } },
            },
            post: {
                tags: ['Películas'], summary: 'Proponer película (queda pendiente)', security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MovieInput' } } } },
                responses: { 201: { description: 'Propuesta creada.' }, 401: { description: 'Autenticación requerida.' }, 409: { description: 'El título ya existe.' } },
            },
        },
        '/movies/pending': {
            get: { tags: ['Películas'], summary: 'Listar propuestas pendientes (administrador)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Propuestas pendientes.' }, 403: { description: 'Se requiere administrador.' } } },
        },
        '/movies/{id}': {
            parameters: [{ $ref: '#/components/parameters/Id' }],
            get: { tags: ['Películas'], summary: 'Consultar detalle con categorías, reparto, dirección y reseñas', responses: { 200: { description: 'Detalle de película.' }, 404: { description: 'No encontrada o no visible.' } } },
            put: {
                tags: ['Películas'], summary: 'Actualizar película (creador o administrador)', security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MovieUpdateInput' } } } },
                responses: { 200: { description: 'Película actualizada.' }, 403: { description: 'No tiene permiso.' }, 404: { description: 'No encontrada.' } },
            },
            delete: { tags: ['Películas'], summary: 'Eliminar película (creador o administrador)', security: [{ bearerAuth: [] }], responses: { 204: { description: 'Eliminada junto con relaciones dependientes.' }, 403: { description: 'No tiene permiso.' } } },
        },
        '/movies/{id}/approve': {
            parameters: [{ $ref: '#/components/parameters/Id' }],
            patch: { tags: ['Películas'], summary: 'Aprobar película (administrador)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Película aprobada.' }, 403: { description: 'Se requiere administrador.' }, 404: { description: 'No encontrada.' } } },
        },
        '/reviews': {
            get: {
                tags: ['Reseñas'], summary: 'Listar reseñas públicas',
                parameters: [{ name: 'movieId', in: 'query', schema: { type: 'integer', minimum: 1 } }],
                responses: { 200: { description: 'Reseñas de películas aprobadas.' } },
            },
            post: {
                tags: ['Reseñas'], summary: 'Crear reseña (solo películas aprobadas)', security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewInput' } } } },
                responses: { 201: { description: 'Reseña creada y rating de película actualizado en una transacción.' }, 404: { description: 'Película aprobada no encontrada.' } },
            },
        },
        '/reviews/{id}': {
            parameters: [{ $ref: '#/components/parameters/Id' }],
            get: { tags: ['Reseñas'], summary: 'Consultar reseña', responses: { 200: { description: 'Reseña.' }, 404: { description: 'No encontrada.' } } },
            put: {
                tags: ['Reseñas'], summary: 'Editar reseña propia (o moderación de administrador)', security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewUpdateInput' } } } },
                responses: { 200: { description: 'Reseña actualizada; rating de película ajustado si cambió la calificación.' }, 403: { description: 'No tiene permiso.' } },
            },
            delete: { tags: ['Reseñas'], summary: 'Eliminar reseña propia (o moderación de administrador)', security: [{ bearerAuth: [] }], responses: { 204: { description: 'Reseña eliminada y rating actualizado.' }, 403: { description: 'No tiene permiso.' } } },
        },
        '/reviews/{id}/reaction': {
            parameters: [{ $ref: '#/components/parameters/Id' }],
            put: {
                tags: ['Reseñas'], summary: 'Crear o cambiar reacción a reseña ajena', security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReactionInput' } } } },
                responses: { 200: { description: 'Reacción aplicada; contadores actualizados en una transacción.' }, 403: { description: 'No puede reaccionar a su propia reseña.' }, 404: { description: 'Reseña no encontrada.' } },
            },
            delete: { tags: ['Reseñas'], summary: 'Quitar reacción propia', security: [{ bearerAuth: [] }], responses: { 204: { description: 'Reacción eliminada y contador actualizado.' }, 404: { description: 'Reacción no encontrada.' } } },
        },
        '/version': {
            get: { tags: ['Sistema'], summary: 'Consultar versión semver', responses: { 200: { description: 'Versión de package.json.' } } },
        },
    },
    components: {
        parameters: {
            Id: { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        },
        schemas: {
            RegisterInput: { type: 'object', required: ['username', 'email', 'password'], properties: { username: { type: 'string', minLength: 3, maxLength: 50 }, email: { type: 'string', format: 'email', maxLength: 120 }, password: { type: 'string', minLength: 8, maxLength: 72, format: 'password' } } },
            LoginInput: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', format: 'password' } } },
            CategoryInput: { type: 'object', required: ['categoryName'], properties: { categoryName: { type: 'string', minLength: 1, maxLength: 80 } } },
            MovieInput: { type: 'object', required: ['movieName', 'overview', 'releaseYear', 'categoryIds'], properties: { movieName: { type: 'string', maxLength: 100 }, overview: { type: 'string', maxLength: 500 }, releaseYear: { type: 'integer', minimum: 1, maximum: 65535 }, imageUrl: { type: 'string', format: 'uri', maxLength: 500, nullable: true }, runtime: { type: 'integer', minimum: 1, nullable: true }, budget: { type: 'integer', minimum: 0, nullable: true }, grossWorldwide: { type: 'integer', minimum: 0, nullable: true }, categoryIds: { type: 'array', minItems: 1, items: { type: 'integer', minimum: 1 } } } },
            MovieUpdateInput: { type: 'object', minProperties: 1, properties: { movieName: { type: 'string', minLength: 1, maxLength: 100 }, overview: { type: 'string', minLength: 1, maxLength: 500 }, releaseYear: { type: 'integer', minimum: 1, maximum: 65535 }, imageUrl: { type: 'string', format: 'uri', maxLength: 500, nullable: true }, runtime: { type: 'integer', minimum: 1, nullable: true }, budget: { type: 'integer', minimum: 0, nullable: true }, grossWorldwide: { type: 'integer', minimum: 0, nullable: true }, categoryIds: { type: 'array', minItems: 1, items: { type: 'integer', minimum: 1 } } } },
            ReviewInput: { type: 'object', required: ['movieId', 'title', 'comment', 'rating'], properties: { movieId: { type: 'integer', minimum: 1 }, title: { type: 'string', maxLength: 150 }, comment: { type: 'string', maxLength: 500 }, rating: { type: 'integer', minimum: 1, maximum: 10 } } },
            ReviewUpdateInput: { type: 'object', minProperties: 1, properties: { title: { type: 'string', maxLength: 150 }, comment: { type: 'string', maxLength: 500 }, rating: { type: 'integer', minimum: 1, maximum: 10 } } },
            ReactionInput: { type: 'object', required: ['reaction'], properties: { reaction: { type: 'string', enum: ['like', 'dislike'] } } },
        },
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
