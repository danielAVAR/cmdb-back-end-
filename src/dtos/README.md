# DTOs

Cada archivo contiene una clase DTO por tabla. Su constructor copia del objeto recibido únicamente los campos que pertenecen a esa entrada; así se evita pasar todo `req.body` al modelo. Los nombres de propiedades son camelCase y los servicios los convierten a los nombres snake_case de MySQL. `UserDto` conserva la contraseña en texto solo como dato de entrada; el servicio debe hashearla antes de guardarla.
