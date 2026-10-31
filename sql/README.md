# SQL

`schema.sql` crea la base `cmdb` y las tablas, claves foráneas, índices únicos y restricciones requeridas por el backend. Ejecútalo una vez en una base nueva con `mysql -u <usuario> -p < sql/schema.sql`. En producción, conserva los datos y usa migraciones revisadas en lugar de volver a ejecutar el esquema inicial.
