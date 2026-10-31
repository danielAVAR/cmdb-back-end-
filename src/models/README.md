# Modelos

`BaseModel` contiene operaciones SQL CRUD parametrizadas para tablas con una columna `id`; clases como `MovieModel` y `CategoriesModel` fijan el nombre de la tabla. Las relaciones con clave primaria compuesta requieren consultas específicas. Los servicios usan consultas transaccionales cuando deben actualizar varias tablas y mantienen allí las reglas de negocio.
