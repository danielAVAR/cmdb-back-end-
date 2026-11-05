# Plantilla: agregar una función nueva a la API

Esta guía muestra el recorrido completo para agregar una función desde MySQL hasta una ruta HTTP. Está escrita para repetirla en cada nueva función. Sigue el estilo actual del proyecto: Node.js con módulos ES, Express, MySQL con `mysql2/promise`, validación con `express-validator` y respuesta de errores centralizada.

## El recorrido completo

Una petición entra por una ruta, se valida y se revisa su acceso. El controlador la recibe, llama al servicio y convierte el resultado en una respuesta HTTP. El servicio contiene las reglas de negocio y las consultas SQL. MySQL guarda los datos. Si algo falla, el error llega al manejador central.

```text
Cliente → src/app.js → src/routes/index.js → feature.routes.js
       → autenticación/autorización → validator → validate middleware
       → controller → service → MySQL
       → respuesta JSON o errorHandler
```

No todas las funciones necesitan todas las piezas. Una ruta de solo lectura podría no necesitar DTO o escritura en la base. Para una función CRUD común, usa todos los pasos siguientes.

## Antes de escribir código

1. Escribe en una frase qué puede hacer la persona usuaria. Ejemplo: “Los usuarios autenticados pueden guardar películas en su lista y consultar su propia lista”.
2. Decide las operaciones y sus rutas: por ejemplo `GET /favorites`, `POST /favorites/:movieId` y `DELETE /favorites/:movieId`.
3. Decide quién puede usar cada operación: público, usuario con JWT, propietario del dato o administrador.
4. Define ejemplos de entrada y salida JSON y los errores esperados (`400`, `401`, `403`, `404`, `409`).
5. Revisa si se relaciona con tablas que ya existen. Reutiliza `users`, `movies`, `reviews` y demás cuando representen correctamente el dato; no dupliques datos que ya tienen una fuente principal.

## Paso 1: guardar la estructura en la base de datos

Para el ejemplo, agregaremos favoritos de películas. Un favorito une a un usuario con una película; la misma pareja no debe aparecer dos veces.

Agrega esto a `sql/schema.sql`, cerca de las tablas relacionadas:

```sql
CREATE TABLE user_favorites (
  user_id INT UNSIGNED NOT NULL,
  movie_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, movie_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

Qué hace cada parte:

- `user_id` y `movie_id` apuntan a registros que ya existen.
- `PRIMARY KEY (user_id, movie_id)` evita favoritos duplicados.
- Las claves foráneas impiden guardar IDs inventados.
- `ON DELETE CASCADE` borra los favoritos si se borra el usuario o la película.
- `created_at` registra cuándo se guardó.

**Importante:** `sql/schema.sql` crea la estructura para una base nueva; editarlo no actualiza automáticamente una base local que ya existe. Para actualizar una base existente, crea un archivo nuevo, por ejemplo `sql/migrations/001_create_user_favorites.sql`, con el `CREATE TABLE` anterior y ejecútalo una vez contra la base correcta:

```bash
mysql -u <usuario> -p cmdb < sql/migrations/001_create_user_favorites.sql
```

No uses `DROP DATABASE` ni el script `setup.sql` para conservar datos. Comprueba que la tabla exista antes de seguir:

```sql
SHOW TABLES LIKE 'user_favorites';
DESCRIBE user_favorites;
```

Si la función necesita un índice, una columna o una relación nueva, piensa también qué pasa al eliminar el dato relacionado y si puede haber duplicados. Los cambios de producción necesitan una migración que se pueda aplicar sin borrar los datos actuales.

## Paso 2: crear el DTO

Un DTO toma los campos permitidos de la petición y evita que el servicio copie datos arbitrarios del cliente. Crea `src/dtos/favorite.dto.js`:

```js
export default class FavoriteDto {
  constructor(data) {
    this.movieId = data.movieId;
  }
}
```

No incluyas `userId` en el cuerpo JSON: lo obtendremos del JWT (`req.user.id`). Así una persona no puede crear favoritos a nombre de otra.

## Paso 3: crear el servicio

El servicio habla con la base y contiene las reglas de negocio. Crea `src/services/favorites.service.js`:

```js
import db from '../config/db.js';
import { ApiError } from '../utils/apiError.js';
import FavoriteDto from '../dtos/favorite.dto.js';

export default class FavoritesService {
  async list(userId) {
    const [rows] = await db.execute(
      `SELECT m.id, m.movie_name, m.release_year, uf.created_at
       FROM user_favorites uf
       JOIN movies m ON m.id = uf.movie_id
       WHERE uf.user_id = ? AND m.status = 'approved'
       ORDER BY uf.created_at DESC`,
      [userId],
    );
    return rows;
  }

  async add(userId, data) {
    const dto = new FavoriteDto(data);
    const [movies] = await db.execute(
      "SELECT id FROM movies WHERE id = ? AND status = 'approved'",
      [dto.movieId],
    );
    if (!movies[0]) throw new ApiError(404, 'Approved movie not found');

    await db.execute(
      'INSERT INTO user_favorites (user_id, movie_id) VALUES (?, ?)',
      [userId, dto.movieId],
    );
    return { userId, movieId: dto.movieId };
  }

  async remove(userId, movieId) {
    const [result] = await db.execute(
      'DELETE FROM user_favorites WHERE user_id = ? AND movie_id = ?',
      [userId, movieId],
    );
    if (result.affectedRows === 0) throw new ApiError(404, 'Favorite not found');
  }
}
```

The `?` placeholders keep values separate from SQL. Always use them for user-provided values; never build SQL by inserting a request string into the query. Table and column names cannot use placeholders, so keep those fixed in your code. The unique primary key makes a second add return MySQL duplicate-entry error; the shared error handler converts that to `409`.

If one operation changes multiple related rows that must succeed together, use a transaction like `ReviewsService.create`: get a connection, begin, make all changes, commit; on error rollback; always release the connection in `finally`.

## Paso 4: crear los validadores

Create `src/validators/favorites.validator.js`:

```js
import { param } from 'express-validator';

export const movieIdValidator = [
  param('movieId').isInt({ min: 1 }).withMessage('movieId must be a positive integer'),
];
```

The project uses `express-validator`. Validate every path, query, and body value that the endpoint accepts: type, allowed values, length, and ranges. For a JSON body, use `body('field')`; for a URL value, use `param('field')`; for `?sort=...`, use `query('sort')`. Optional fields need `.optional()` and nullable values may need `.optional({ nullable: true })`. Validation errors become HTTP `400` through the `validate` middleware.

## Paso 5: crear el controlador

Create `src/controllers/favorites.controller.js`:

```js
import FavoritesService from '../services/favorites.service.js';

const favorites = new FavoritesService();

export const listFavorites = async (req, res, next) => {
  try {
    res.json({ success: true, data: await favorites.list(req.user.id) });
  } catch (error) { next(error); }
};

export const addFavorite = async (req, res, next) => {
  try {
    res.status(201).json({ success: true, data: await favorites.add(req.user.id, req.body) });
  } catch (error) { next(error); }
};

export const removeFavorite = async (req, res, next) => {
  try {
    await favorites.remove(req.user.id, Number(req.params.movieId));
    res.status(204).end();
  } catch (error) { next(error); }
};
```

Keep controllers small: read request values, call the service, choose an HTTP status, and pass errors to `next(error)`. Do not put SQL here. The normal response shape is `{ success: true, data: ... }`; delete endpoints commonly return `204` with no body.

## Paso 6: crear las rutas

Create `src/routes/favorites.routes.js`:

```js
import { Router } from 'express';
import { addFavorite, listFavorites, removeFavorite } from '../controllers/favorites.controller.js';
import auth from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { movieIdValidator } from '../validators/favorites.validator.js';

const router = Router();

router.get('/', auth, listFavorites);
router.post('/:movieId', auth, movieIdValidator, validate, addFavorite);
router.delete('/:movieId', auth, movieIdValidator, validate, removeFavorite);

export default router;
```

Order the pieces as `path, authentication/authorization, validators, validate, controller`. `auth` verifies a JWT and sets `req.user`. Use `requireRole('administrator')` after `auth` for administrator-only routes. A public route does not need `auth`. Never trust a user ID supplied by the client when the logged-in user is the owner.

## Paso 7: conectar la nueva ruta

Open `src/routes/index.js`. Import the router and mount it under a clear plural name:

```js
import favoritesRoutes from './favorites.routes.js';
// ...the other router imports

router.use('/favorites', favoritesRoutes);
```

The complete URL is assembled in two parts: `src/app.js` mounts the index at `/api/v1`, and this line mounts the feature at `/favorites`. So the route `GET /` in this router becomes `GET /api/v1/favorites`.

## Paso 8: document the API

This project defines its OpenAPI/Swagger description in `src/config/swagger.js`. Add the new paths, request/response descriptions, security requirement, and schemas there. For this example, document:

- `GET /favorites`: JWT required; returns the signed-in user's approved favorite movies.
- `POST /favorites/{movieId}`: JWT required; returns `201`; `404` if the approved movie does not exist; `409` if already saved.
- `DELETE /favorites/{movieId}`: JWT required; returns `204`; `404` if not in the user's list.
- A path parameter definition for `movieId` and the matching success/error responses.

Swagger paths are relative to the server base `/api/v1`; write `/favorites`, not `/api/v1/favorites`. Add a tag if this feature deserves its own group. Keep the documentation in sync whenever route inputs or outputs change.

## Paso 9: actualizar documentación de la carpeta

If the new feature changes what this folder exports or adds a new route module, update `src/routes/README.md` (create it if it does not exist) with the route file name, base path, access rules, and operations. If it adds a new service, DTO, validator, or controller, follow the existing convention of documenting each folder in that folder's `README.md` when appropriate. This guide itself lives in `src/routes/FEATURE_TEMPLATE.md` so it can be found beside the route modules.

## Paso 10: comprobar la función

Do these checks before calling the work done:

1. Confirm the database table/columns exist in the database you are running against.
2. Start the API with `npm run dev`; fix import errors or startup errors.
3. Open `http://localhost:3000/api-docs` and confirm the new paths and schemas appear.
4. Send a request with the expected input. For private routes, log in and send `Authorization: Bearer <token>`.
5. Check the normal case and the important failure cases: missing/invalid input (`400`), no token (`401`), wrong role (`403`), absent record (`404`), duplicate (`409`).
6. Check the database afterward to verify the expected row was inserted, updated, or deleted.
7. Check that another user's data cannot be read or changed by changing an ID in the URL.

The project currently has `npm run dev` and `npm start`, but no configured test script. Do not assume tests ran simply because the server started. If you add automated tests, also add and document the command that runs them.

## Lista para copiar para la próxima función

Replace `feature` and `Thing` with the real feature name. Remove steps that truly do not apply, and add steps for external services or background jobs if the feature needs them.

```text
[ ] Agree on behavior, route names, access, JSON, and errors.
[ ] Add/alter tables, constraints, and indexes in sql/schema.sql.
[ ] Add a migration for databases that already contain data.
[ ] Add src/dtos/feature.dto.js if request fields need mapping.
[ ] Add src/services/feature.service.js with parameterized SQL and business rules.
[ ] Add src/validators/feature.validator.js for params, query, and body.
[ ] Add src/controllers/feature.controller.js for HTTP handling.
[ ] Add src/routes/feature.routes.js with auth/role/validation middleware.
[ ] Mount the router in src/routes/index.js.
[ ] Describe paths and schemas in src/config/swagger.js.
[ ] Update folder README files when their contents/conventions change.
[ ] Start the API and verify success, validation, auth, access, and database behavior.
```

## Ideas for future features that fit this project

These are possibilities based on the current movie, review, and user data. They are examples, not features that already exist:

- **Actor and director pages:** `actors`, `directors`, `movie_actors`, and `movie_directors` tables already exist, and DTO/model files exist, but there are no actor/director API routes yet. Add public listing/detail endpoints and administrator-managed create/update operations.
- **Favorite/watchlist:** connect users to movies. The example in this guide demonstrates a `user_favorites` table and private routes.
- **Watch status:** let a user mark a movie as watched or planned, with an optional watched date. This can be a user-to-movie join table with a status field.
- **Review reporting and moderation:** let users report a review, then let administrators list and resolve reports. This needs a reports table, ownership rules, validation, and admin routes.
- **User profile:** expose safe profile details and allow a user to update their own display name or avatar URL. Do not return password hashes or administrator fields in public responses.
- **Movie recommendations:** recommend movies based on categories, reviews, or user favorites. Begin with a clear read-only endpoint and state how ranking is calculated.
- **Search and pagination:** add validated search, page/limit parameters, stable sorting, and response metadata to movie/review listings.
- **Review comments or spoiler flags:** extend review-related behavior with carefully defined ownership and moderation rules.

Before starting any example, confirm it still matches the database and product rules at that time. Prefer extending the existing feature when the data and permissions belong together.
