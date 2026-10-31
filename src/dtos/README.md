# DTOs

Cada archivo contiene una clase DTO por tabla. Su constructor copia del objeto recibido únicamente los campos que pertenecen a esa entrada; así se evita pasar todo `req.body` al modelo. Los servicios usan los DTOs y convierten sus propiedades camelCase a las columnas snake_case de MySQL. `UserDto` conserva la contraseña en texto solo como dato de entrada; el servicio la hashea antes de guardarla.
