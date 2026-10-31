# Controladores

Los controladores reciben `req` y `res`, llaman al servicio correspondiente y construyen la respuesta HTTP. Los errores se envían a `next(error)` para que el middleware centralizado aplique el formato y código HTTP comunes. `people.controller.js` administra actores, directores y sus asociaciones. La lógica SQL y de negocio vive en `services/`.
