# Middlewares

`auth.middleware.js` verifica el JWT usando Passport y define `req.user`. `role.middleware.js` restringe acciones administrativas mediante `administrator`. `validate.middleware.js` convierte errores de `express-validator` en HTTP 400. `rateLimit.middleware.js` limita tráfico general y autenticación. `notFound.middleware.js` y `error.middleware.js` manejan rutas inexistentes y errores de forma centralizada.
