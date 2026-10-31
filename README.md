# Carlos Movie Database (CMDB)

API para descubrir películas, anime y series geek, publicar reseñas, reaccionar a reseñas y consultar un ranking. El backend usa Node.js, Express y MySQL. El frontend se desarrolla en un repositorio independiente.

## Requisitos

- Node.js 20 o posterior y npm.
- MySQL 8 o posterior.

## Instalación y ejecución

1. Instala dependencias con `npm ci`.
2. Copia `.env.example` a `.env` y configura la conexión a MySQL y un secreto JWT aleatorio.
3. Crea las tablas ejecutando `mysql -u <usuario> -p < sql/schema.sql`.
4. Inicia el servidor con `npm run dev`.

La API queda disponible en `http://localhost:3000/api/v1` y Swagger UI en `http://localhost:3000/api-docs`.

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `APP_PORT` | Puerto HTTP; por defecto `3000`. |
| `FRONTEND_URL` | Origen permitido por CORS, por ejemplo `http://localhost:5500`. |
| `DB_HOST`, `DB_PORT` | Dirección y puerto MySQL. |
| `DB_NAME` | Base de datos; por defecto `cmdb`. |
| `DB_USER`, `DB_PASSWORD` | Credenciales MySQL. |
| `DB_CONNECTION_LIMIT` | Máximo de conexiones del pool. |
| `JWT_SECRET` | Secreto largo y aleatorio para firmar tokens. |
| `JWT_EXPIRES_IN` | Vigencia del token, por ejemplo `1h` o `7d`. |

No subas `.env` al repositorio.

## Autenticación y permisos

El registro crea usuarios normales. El administrador se representa mediante `users.administrator`; no existe un endpoint público para elevar ese permiso. Para probar endpoints administrativos, cambia el valor de ese campo directamente en una base de datos local de desarrollo. El login devuelve un JWT; envíalo como `Authorization: Bearer <token>`.

Las películas nuevas quedan `pending`. Un administrador puede listarlas en `GET /movies/pending` y aprobarlas con `PATCH /movies/:id/approve`. Los usuarios autenticados pueden proponer películas, pero solo quien la creó o un administrador puede editarla o borrarla.

## Endpoints principales

Todos los endpoints están documentados y se pueden probar en Swagger UI.

| Método | Ruta | Acceso | Acción |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Público | Registrar usuario. |
| `POST` | `/auth/login` | Público | Iniciar sesión y obtener JWT. |
| `GET` | `/auth/me` | JWT | Consultar el usuario autenticado. |
| `GET`, `GET /:id` | `/categories` | Público | Listar y consultar categorías. |
| `POST`, `PUT /:id`, `DELETE /:id` | `/categories` | Administrador | Administrar categorías. |
| `GET` | `/movies?sort=ranking&categoryId=1` | Público | Listar películas aprobadas y filtrar/ordenar. |
| `GET /:id` | `/movies` | Público | Consultar detalle, categorías, reparto, dirección y reseñas. |
| `POST`, `PUT /:id`, `DELETE /:id` | `/movies` | JWT | Proponer/editar/eliminar una película según permisos. |
| `GET /pending`, `PATCH /:id/approve` | `/movies` | Administrador | Revisar y aprobar propuestas. |
| `GET /?movieId=1`, `GET /:id` | `/reviews` | Público | Consultar reseñas. |
| `POST`, `PUT /:id`, `DELETE /:id` | `/reviews` | JWT | Crear y administrar reseñas propias. |
| `PUT /:id/reaction`, `DELETE /:id/reaction` | `/reviews` | JWT | Dar/quitar like o dislike a reseñas ajenas. |
| `GET`, `GET /:id` | `/people/actors`, `/people/directors` | Público | Consultar actores y directores. |
| `POST`, `PUT /:id`, `DELETE /:id` | `/people/actors`, `/people/directors` | Administrador | Administrar personas del catálogo. |
| `PUT /movies/:movieId/actors`, `PUT /movies/:movieId/directors` | `/people` | Administrador | Reemplazar las relaciones de reparto y dirección. |
| `GET` | `/version` | Público | Consultar versión de la API. |

Ejemplo de registro:

```http
POST /api/v1/auth/register
Content-Type: application/json

{"username":"ana","email":"ana@example.com","password":"una-clave-segura"}
```

Ejemplo de propuesta de película (requiere JWT):

```json
{
  "movieName": "Ejemplo",
  "overview": "Descripción de la película.",
  "releaseYear": 2025,
  "categoryIds": [1],
  "imageUrl": null
}
```

## Frontend

El frontend independiente se construye con HTML, CSS y JavaScript sin framework. Su URL de repositorio todavía no está definida; agréguese aquí cuando exista.

## Estructura

La documentación en español de cada carpeta está junto a sus archivos, en `README.md` dentro de la carpeta correspondiente.

## Licencia

ISC.
