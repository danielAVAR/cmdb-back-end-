# Validadores

Los validadores definen reglas de `express-validator` por recurso y operación. `people.validator.js` comprueba los campos de actores, directores y sus asociaciones. Las rutas los ejecutan antes del controlador junto con `validate.middleware.js`; por eso una entrada inválida responde HTTP 400 sin llegar al servicio ni a MySQL.
