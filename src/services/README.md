# Servicios

Los servicios encapsulan reglas de negocio y acceso a MySQL. Autenticación hashea contraseñas; películas mantienen categorías y flujo de aprobación; reseñas ajustan `rating_sum` y `rating_count`; reacciones sincronizan likes/dislikes con `user_reactions`; ranking pondera calificación, reacciones y antigüedad. Las escrituras relacionadas usan transacciones MySQL.
