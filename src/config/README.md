# Configuración

`db.js` crea el pool de conexiones MySQL con variables de entorno. `jwt.js` valida y expone la configuración del token. `passport.js` registra la estrategia Bearer JWT. `swagger.js` define OpenAPI y Swagger UI. Los secretos se guardan en `.env`, nunca en el código.
