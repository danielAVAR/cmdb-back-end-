# cmdb-back-end
The_Carlos_Movie_Data_Base_back_end



## Arquitectura:

```
cmdb-back-end/
├── package.json
├── package-lock.json
├── .env                      # Credenciales reales (ignorado en Git)
├── .env.example              # Plantilla con los mismos nombres, sin valores
├── .gitignore                # node_modules/ y .env
├── README.md
├── sql/
│   └── schema.sql            # Creación de la base de datos y tablas
└── src/
    ├── server.js             # Carga dotenv y arranca el servidor
    ├── app.js                # Configura Express: cors, json, rate limit, rutas, swagger, errores
    ├── config/
    │   ├── db.js             # Pool de mysql2
    │   ├── passport.js       # Estrategia JWT
    │   └── swagger.js        # Carga la documentación OpenAPI
    ├── utils/
    │   ├── ApiError.js       # Error con código HTTP y mensaje
    │   └── constants.js      # ROLES, MOVIE_STATUS, VOTE_TYPES
    ├── models/               # Consultas SQL por tabla (sin ORM)
    │   ├── user.model.js
    │   ├── category.model.js
    │   ├── movie.model.js
    │   ├── review.model.js
    │   └── vote.model.js
    ├── services/             # Lógica de negocio y transacciones
    │   ├── auth.service.js
    │   ├── categories.service.js
    │   ├── movies.service.js
    │   ├── reviews.service.js    # Crea reseña con rating inicial (transacción)
    │   ├── votes.service.js      # Likes y dislikes (transacción)
    │   └── ranking.service.js    # Cálculo del ranking ponderado
    ├── validators/           # Reglas de express-validator
    │   ├── auth.validator.js
    │   ├── categories.validator.js
    │   ├── movies.validator.js
    │   └── reviews.validator.js
    ├── middlewares/
    │   ├── auth.middleware.js       # Exige JWT válido (passport-jwt)
    │   ├── role.middleware.js       # requireRole('admin') → 403 si no aplica
    │   ├── validate.middleware.js   # Revisa resultados de express-validator → 400
    │   ├── rateLimit.middleware.js  # Límites generales y más estrictos para login
    │   ├── notFound.middleware.js   # 404 para rutas inexistentes
    │   └── error.middleware.js      # Manejo centralizado (ApiError, ER_DUP_ENTRY → 409)
    ├── controllers/          # Leen req, llaman al service y responden
    │   ├── auth.controller.js
    │   ├── categories.controller.js
    │   ├── movies.controller.js
    │   └── reviews.controller.js
    └── routes/               # URLs y middlewares por endpoint
        ├── index.js          # Monta todo bajo /api/v1
        ├── auth.routes.js
        ├── categories.routes.js
        ├── movies.routes.js
        └── reviews.routes.js

```