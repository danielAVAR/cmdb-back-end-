-- Esquema y datos de prueba de CMDB, en un solo script.
-- Borra la base si existe: úsalo solo en una base de pruebas.
-- Ejecutar: mysql -u root -p < sql/setup.sql

DROP DATABASE IF EXISTS cmdb;

-- Esquema de KarenFlix (base cmdb).
-- Ejecutar con: mysql -u <usuario> -p < sql/schema.sql

CREATE DATABASE IF NOT EXISTS cmdb;

USE cmdb;



-- Usuarios
CREATE TABLE users (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  administrator BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- Categorías
CREATE TABLE categories (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Películas
CREATE TABLE movies (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  movie_name VARCHAR(100) NOT NULL UNIQUE,
  overview VARCHAR(500) NOT NULL,
  release_year SMALLINT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NULL,
  status ENUM('pending', 'approved') NOT NULL DEFAULT 'pending',
  runtime SMALLINT UNSIGNED NULL,
  budget BIGINT UNSIGNED NULL,
  gross_worldwide BIGINT UNSIGNED NULL,
  rating_sum INT UNSIGNED NOT NULL DEFAULT 0,
  rating_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- Reseñas
CREATE TABLE reviews (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  movie_id INT UNSIGNED NOT NULL,
  title VARCHAR(150) NOT NULL,
  comment VARCHAR(500) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  likes INT UNSIGNED NOT NULL DEFAULT 0,
  dislikes INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (rating BETWEEN 1 AND 10),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- historial de acciones del usuario
CREATE TABLE historial (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL,
  review_id INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Reacciones likes y dislikes
CREATE TABLE user_reactions (
  user_id INT UNSIGNED NOT NULL,
  review_id INT UNSIGNED NOT NULL,
  reaction ENUM('like', 'dislike') NOT NULL,
  PRIMARY KEY (user_id, review_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Relación muchos a muchos películas y categorías
CREATE TABLE movie_categories (
  movie_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (movie_id, category_id),
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

-- Extensión opcional (sin endpoints en esta versión)
CREATE TABLE actors (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  actor_name VARCHAR(150) NOT NULL,
  biography VARCHAR(500) NULL,
  birthdate DATE NULL
) ENGINE=InnoDB;

CREATE TABLE directors (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  director_name VARCHAR(150) NOT NULL,
  biography VARCHAR(500) NULL
) ENGINE=InnoDB;

CREATE TABLE movie_actors (
  movie_id INT UNSIGNED NOT NULL,
  actor_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (movie_id, actor_id),
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES actors(id)
) ENGINE=InnoDB;

CREATE TABLE movie_directors (
  movie_id INT UNSIGNED NOT NULL,
  director_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (movie_id, director_id),
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (director_id) REFERENCES directors(id)
) ENGINE=InnoDB;

SET NAMES utf8mb4;
-- Datos de prueba para CMDB (desarrollo local).
-- Ejecutar sobre una base recién creada con sql/schema.sql:
--   mysql -u root -p cmdb < sql/seed.sql
--
-- Contraseña de TODOS los usuarios de prueba: Clave123456
-- Películas, directores y actores son reales (año, duración y nombres).
-- Usuarios, reseñas y reacciones son de ejemplo.

USE cmdb;

-- 1. Usuarios
INSERT INTO users (username, email, password_hash, administrator) VALUES
('admin_cmdb',   'admin@example.com',        '$2b$12$tqqUQUBfcvbYRD8qf2/2aexWEWJ.ZTqLj1YXndEP364b5RTWsYHnm', TRUE),
('ana_lopez',    'ana.lopez@example.com',    '$2b$12$tqqUQUBfcvbYRD8qf2/2aexWEWJ.ZTqLj1YXndEP364b5RTWsYHnm', FALSE),
('luis_garcia',  'luis.garcia@example.com',  '$2b$12$tqqUQUBfcvbYRD8qf2/2aexWEWJ.ZTqLj1YXndEP364b5RTWsYHnm', FALSE),
('sofia_mendez', 'sofia.mendez@example.com', '$2b$12$tqqUQUBfcvbYRD8qf2/2aexWEWJ.ZTqLj1YXndEP364b5RTWsYHnm', FALSE),
('carlos_ruiz',  'carlos.ruiz@example.com',  '$2b$12$tqqUQUBfcvbYRD8qf2/2aexWEWJ.ZTqLj1YXndEP364b5RTWsYHnm', FALSE),
('maria_torres', 'maria.torres@example.com', '$2b$12$tqqUQUBfcvbYRD8qf2/2aexWEWJ.ZTqLj1YXndEP364b5RTWsYHnm', FALSE);

-- 2. Categorías (10)
INSERT INTO categories (category_name) VALUES
('Anime'), ('Ciencia Ficción'), ('Superhéroes'), ('Fantasía'), ('Acción'),
('Terror'), ('Comedia'), ('Drama'), ('Animación'), ('Suspenso');

-- 3. Directores
INSERT INTO directors (director_name) VALUES
('Christopher Nolan'), ('Hayao Miyazaki'), ('Denis Villeneuve'), ('Quentin Tarantino'),
('Stanley Kubrick'), ('Bob Persichetti'), ('Peter Ramsey'), ('Rodney Rothman'),
('Makoto Shinkai'), ('John Lasseter'), ('Katsuhiro Otomo'), ('Ari Aster'),
('Wes Anderson'), ('Matt Reeves'), ('Lee Unkrich'), ('Adrian Molina'), ('George Miller');

-- 4. Actores (birthdate NULL cuando no lo tengo confirmado)
INSERT INTO actors (actor_name, birthdate) VALUES
('Matthew McConaughey', '1969-11-04'),
('Anne Hathaway',       '1982-11-12'),
('Jessica Chastain',    '1977-03-24'),
('Christian Bale',      '1974-01-30'),
('Heath Ledger',        '1979-04-04'),
('Aaron Eckhart',       '1968-03-12'),
('Rumi Hiiragi',        NULL),
('Miyu Irino',          NULL),
('Ryan Gosling',        '1980-11-12'),
('Harrison Ford',       '1942-07-13'),
('Ana de Armas',        '1988-04-30'),
('John Travolta',       '1954-02-18'),
('Samuel L. Jackson',   '1948-12-21'),
('Uma Thurman',         '1970-04-29'),
('Jack Nicholson',      '1937-04-22'),
('Shelley Duvall',      '1949-07-07'),
('Shameik Moore',       NULL),
('Jake Johnson',        NULL),
('Ryunosuke Kamiki',    NULL),
('Mone Kamishiraishi',  NULL),
('Tom Hanks',           '1956-07-09'),
('Tim Allen',           '1953-06-13'),
('Toni Collette',       '1972-11-01'),
('Alex Wolff',          NULL),
('Ralph Fiennes',       '1962-12-22'),
('Tony Revolori',       NULL),
('Robert Pattinson',    '1986-05-13'),
('Zoë Kravitz',         NULL),
('Anthony Gonzalez',    NULL),
('Gael García Bernal',  NULL),
('Tom Hardy',           '1977-09-15'),
('Charlize Theron',     '1975-08-07');

-- 5. Películas: 12 aprobadas y 3 pendientes (para probar el flujo de aprobación)
INSERT INTO movies (movie_name, overview, release_year, image_url, status, runtime, budget, gross_worldwide, created_by) VALUES
('Interstellar', 'Un grupo de exploradores atraviesa un agujero de gusano en busca de un nuevo hogar para la humanidad, mientras la Tierra se vuelve cada vez menos habitable.', 2014, NULL, 'approved', 169, 165000000, 677471339, (SELECT id FROM users WHERE username='admin_cmdb')),
('The Dark Knight', 'Batman enfrenta al Joker, un criminal que siembra el caos en Gotham y pone a prueba los límites de la justicia.', 2008, NULL, 'approved', 152, 185000000, 1006234167, (SELECT id FROM users WHERE username='admin_cmdb')),
('Spirited Away', 'Chihiro, una niña de diez años, queda atrapada en un mundo de espíritus y debe trabajar en unos baños termales para salvar a sus padres.', 2001, NULL, 'approved', 125, NULL, NULL, (SELECT id FROM users WHERE username='admin_cmdb')),
('Blade Runner 2049', 'En 2049, un oficial blade runner descubre un secreto que podría sacudir lo que queda de la sociedad.', 2017, NULL, 'approved', 164, NULL, NULL, (SELECT id FROM users WHERE username='admin_cmdb')),
('Pulp Fiction', 'Historias entrelazadas de gánsteres, boxeadores y criminales en Los Ángeles, contadas fuera de orden.', 1994, NULL, 'approved', 154, NULL, NULL, (SELECT id FROM users WHERE username='admin_cmdb')),
('The Shining', 'Un escritor que cuida un hotel aislado en invierno empieza a perder la cordura, con su familia atrapada junto a él.', 1980, NULL, 'approved', 146, NULL, NULL, (SELECT id FROM users WHERE username='admin_cmdb')),
('Spider-Man: Un nuevo universo', 'Miles Morales, un adolescente de Brooklyn, obtiene poderes y se une a otras versiones de Spider-Man para detener un plan que amenaza con romper el multiverso.', 2018, NULL, 'approved', 117, NULL, NULL, (SELECT id FROM users WHERE username='admin_cmdb')),
('Your Name.', 'Dos adolescentes que nunca se han visto empiezan a intercambiar cuerpos sin explicación, y cada uno descubre la vida del otro.', 2016, NULL, 'approved', 106, NULL, NULL, (SELECT id FROM users WHERE username='admin_cmdb')),
('Toy Story', 'Woody, un muñeco vaquero, pierde su lugar como juguete favorito de Andy cuando llega Buzz Lightyear.', 1995, NULL, 'approved', 81, NULL, NULL, (SELECT id FROM users WHERE username='admin_cmdb')),
('Akira', 'En Neo-Tokio, un motociclista de una pandilla desarrolla poderes psíquicos incontrolables, y el gobierno intenta contenerlo.', 1988, NULL, 'approved', 124, NULL, NULL, (SELECT id FROM users WHERE username='admin_cmdb')),
('Hereditary', 'Tras la muerte de su madre, una familia comienza a descubrir secretos perturbadores sobre su pasado.', 2018, NULL, 'approved', 127, NULL, NULL, (SELECT id FROM users WHERE username='admin_cmdb')),
('The Grand Budapest Hotel', 'Un conserje legendario y su joven aprendiz se ven envueltos en el robo de una pintura valiosa y en una lucha por una herencia.', 2014, NULL, 'approved', 99, NULL, NULL, (SELECT id FROM users WHERE username='admin_cmdb')),
('The Batman', 'Un Batman todavía en sus primeros años investiga una serie de asesinatos que apuntan a la élite de Gotham.', 2022, NULL, 'pending', 176, NULL, NULL, (SELECT id FROM users WHERE username='ana_lopez')),
('Coco', 'Miguel, un niño que sueña con ser músico, viaja al mundo de los muertos en el Día de Muertos para descubrir la historia de su familia.', 2017, NULL, 'pending', 105, NULL, NULL, (SELECT id FROM users WHERE username='maria_torres')),
('Mad Max: Furia en la carretera', 'En un mundo postapocalíptico, una rebelde escapa con un grupo de mujeres en un camión de combustible, perseguidos por un tirano.', 2015, NULL, 'pending', 120, NULL, NULL, (SELECT id FROM users WHERE username='ana_lopez'));

-- 6. Relación películas y categorías
INSERT INTO movie_categories (movie_id, category_id) VALUES
((SELECT id FROM movies WHERE movie_name='Interstellar'), (SELECT id FROM categories WHERE category_name='Ciencia Ficción')),
((SELECT id FROM movies WHERE movie_name='Interstellar'), (SELECT id FROM categories WHERE category_name='Drama')),
((SELECT id FROM movies WHERE movie_name='The Dark Knight'), (SELECT id FROM categories WHERE category_name='Superhéroes')),
((SELECT id FROM movies WHERE movie_name='The Dark Knight'), (SELECT id FROM categories WHERE category_name='Acción')),
((SELECT id FROM movies WHERE movie_name='The Dark Knight'), (SELECT id FROM categories WHERE category_name='Suspenso')),
((SELECT id FROM movies WHERE movie_name='Spirited Away'), (SELECT id FROM categories WHERE category_name='Anime')),
((SELECT id FROM movies WHERE movie_name='Spirited Away'), (SELECT id FROM categories WHERE category_name='Animación')),
((SELECT id FROM movies WHERE movie_name='Spirited Away'), (SELECT id FROM categories WHERE category_name='Fantasía')),
((SELECT id FROM movies WHERE movie_name='Blade Runner 2049'), (SELECT id FROM categories WHERE category_name='Ciencia Ficción')),
((SELECT id FROM movies WHERE movie_name='Blade Runner 2049'), (SELECT id FROM categories WHERE category_name='Suspenso')),
((SELECT id FROM movies WHERE movie_name='Pulp Fiction'), (SELECT id FROM categories WHERE category_name='Drama')),
((SELECT id FROM movies WHERE movie_name='Pulp Fiction'), (SELECT id FROM categories WHERE category_name='Suspenso')),
((SELECT id FROM movies WHERE movie_name='The Shining'), (SELECT id FROM categories WHERE category_name='Terror')),
((SELECT id FROM movies WHERE movie_name='The Shining'), (SELECT id FROM categories WHERE category_name='Drama')),
((SELECT id FROM movies WHERE movie_name='Spider-Man: Un nuevo universo'), (SELECT id FROM categories WHERE category_name='Superhéroes')),
((SELECT id FROM movies WHERE movie_name='Spider-Man: Un nuevo universo'), (SELECT id FROM categories WHERE category_name='Animación')),
((SELECT id FROM movies WHERE movie_name='Spider-Man: Un nuevo universo'), (SELECT id FROM categories WHERE category_name='Acción')),
((SELECT id FROM movies WHERE movie_name='Your Name.'), (SELECT id FROM categories WHERE category_name='Anime')),
((SELECT id FROM movies WHERE movie_name='Your Name.'), (SELECT id FROM categories WHERE category_name='Drama')),
((SELECT id FROM movies WHERE movie_name='Your Name.'), (SELECT id FROM categories WHERE category_name='Fantasía')),
((SELECT id FROM movies WHERE movie_name='Toy Story'), (SELECT id FROM categories WHERE category_name='Animación')),
((SELECT id FROM movies WHERE movie_name='Toy Story'), (SELECT id FROM categories WHERE category_name='Comedia')),
((SELECT id FROM movies WHERE movie_name='Akira'), (SELECT id FROM categories WHERE category_name='Anime')),
((SELECT id FROM movies WHERE movie_name='Akira'), (SELECT id FROM categories WHERE category_name='Ciencia Ficción')),
((SELECT id FROM movies WHERE movie_name='Akira'), (SELECT id FROM categories WHERE category_name='Acción')),
((SELECT id FROM movies WHERE movie_name='Hereditary'), (SELECT id FROM categories WHERE category_name='Terror')),
((SELECT id FROM movies WHERE movie_name='Hereditary'), (SELECT id FROM categories WHERE category_name='Drama')),
((SELECT id FROM movies WHERE movie_name='The Grand Budapest Hotel'), (SELECT id FROM categories WHERE category_name='Comedia')),
((SELECT id FROM movies WHERE movie_name='The Grand Budapest Hotel'), (SELECT id FROM categories WHERE category_name='Drama')),
((SELECT id FROM movies WHERE movie_name='The Batman'), (SELECT id FROM categories WHERE category_name='Superhéroes')),
((SELECT id FROM movies WHERE movie_name='The Batman'), (SELECT id FROM categories WHERE category_name='Suspenso')),
((SELECT id FROM movies WHERE movie_name='Coco'), (SELECT id FROM categories WHERE category_name='Animación')),
((SELECT id FROM movies WHERE movie_name='Coco'), (SELECT id FROM categories WHERE category_name='Fantasía')),
((SELECT id FROM movies WHERE movie_name='Mad Max: Furia en la carretera'), (SELECT id FROM categories WHERE category_name='Acción')),
((SELECT id FROM movies WHERE movie_name='Mad Max: Furia en la carretera'), (SELECT id FROM categories WHERE category_name='Ciencia Ficción'));

-- 7. Relación películas y directores
INSERT INTO movie_directors (movie_id, director_id) VALUES
((SELECT id FROM movies WHERE movie_name='Interstellar'), (SELECT id FROM directors WHERE director_name='Christopher Nolan')),
((SELECT id FROM movies WHERE movie_name='The Dark Knight'), (SELECT id FROM directors WHERE director_name='Christopher Nolan')),
((SELECT id FROM movies WHERE movie_name='Spirited Away'), (SELECT id FROM directors WHERE director_name='Hayao Miyazaki')),
((SELECT id FROM movies WHERE movie_name='Blade Runner 2049'), (SELECT id FROM directors WHERE director_name='Denis Villeneuve')),
((SELECT id FROM movies WHERE movie_name='Pulp Fiction'), (SELECT id FROM directors WHERE director_name='Quentin Tarantino')),
((SELECT id FROM movies WHERE movie_name='The Shining'), (SELECT id FROM directors WHERE director_name='Stanley Kubrick')),
((SELECT id FROM movies WHERE movie_name='Spider-Man: Un nuevo universo'), (SELECT id FROM directors WHERE director_name='Bob Persichetti')),
((SELECT id FROM movies WHERE movie_name='Spider-Man: Un nuevo universo'), (SELECT id FROM directors WHERE director_name='Peter Ramsey')),
((SELECT id FROM movies WHERE movie_name='Spider-Man: Un nuevo universo'), (SELECT id FROM directors WHERE director_name='Rodney Rothman')),
((SELECT id FROM movies WHERE movie_name='Your Name.'), (SELECT id FROM directors WHERE director_name='Makoto Shinkai')),
((SELECT id FROM movies WHERE movie_name='Toy Story'), (SELECT id FROM directors WHERE director_name='John Lasseter')),
((SELECT id FROM movies WHERE movie_name='Akira'), (SELECT id FROM directors WHERE director_name='Katsuhiro Otomo')),
((SELECT id FROM movies WHERE movie_name='Hereditary'), (SELECT id FROM directors WHERE director_name='Ari Aster')),
((SELECT id FROM movies WHERE movie_name='The Grand Budapest Hotel'), (SELECT id FROM directors WHERE director_name='Wes Anderson')),
((SELECT id FROM movies WHERE movie_name='The Batman'), (SELECT id FROM directors WHERE director_name='Matt Reeves')),
((SELECT id FROM movies WHERE movie_name='Coco'), (SELECT id FROM directors WHERE director_name='Lee Unkrich')),
((SELECT id FROM movies WHERE movie_name='Coco'), (SELECT id FROM directors WHERE director_name='Adrian Molina')),
((SELECT id FROM movies WHERE movie_name='Mad Max: Furia en la carretera'), (SELECT id FROM directors WHERE director_name='George Miller'));

-- 8. Relación películas y actores
INSERT INTO movie_actors (movie_id, actor_id) VALUES
((SELECT id FROM movies WHERE movie_name='Interstellar'), (SELECT id FROM actors WHERE actor_name='Matthew McConaughey')),
((SELECT id FROM movies WHERE movie_name='Interstellar'), (SELECT id FROM actors WHERE actor_name='Anne Hathaway')),
((SELECT id FROM movies WHERE movie_name='Interstellar'), (SELECT id FROM actors WHERE actor_name='Jessica Chastain')),
((SELECT id FROM movies WHERE movie_name='The Dark Knight'), (SELECT id FROM actors WHERE actor_name='Christian Bale')),
((SELECT id FROM movies WHERE movie_name='The Dark Knight'), (SELECT id FROM actors WHERE actor_name='Heath Ledger')),
((SELECT id FROM movies WHERE movie_name='The Dark Knight'), (SELECT id FROM actors WHERE actor_name='Aaron Eckhart')),
((SELECT id FROM movies WHERE movie_name='Spirited Away'), (SELECT id FROM actors WHERE actor_name='Rumi Hiiragi')),
((SELECT id FROM movies WHERE movie_name='Spirited Away'), (SELECT id FROM actors WHERE actor_name='Miyu Irino')),
((SELECT id FROM movies WHERE movie_name='Blade Runner 2049'), (SELECT id FROM actors WHERE actor_name='Ryan Gosling')),
((SELECT id FROM movies WHERE movie_name='Blade Runner 2049'), (SELECT id FROM actors WHERE actor_name='Harrison Ford')),
((SELECT id FROM movies WHERE movie_name='Blade Runner 2049'), (SELECT id FROM actors WHERE actor_name='Ana de Armas')),
((SELECT id FROM movies WHERE movie_name='Pulp Fiction'), (SELECT id FROM actors WHERE actor_name='John Travolta')),
((SELECT id FROM movies WHERE movie_name='Pulp Fiction'), (SELECT id FROM actors WHERE actor_name='Samuel L. Jackson')),
((SELECT id FROM movies WHERE movie_name='Pulp Fiction'), (SELECT id FROM actors WHERE actor_name='Uma Thurman')),
((SELECT id FROM movies WHERE movie_name='The Shining'), (SELECT id FROM actors WHERE actor_name='Jack Nicholson')),
((SELECT id FROM movies WHERE movie_name='The Shining'), (SELECT id FROM actors WHERE actor_name='Shelley Duvall')),
((SELECT id FROM movies WHERE movie_name='Spider-Man: Un nuevo universo'), (SELECT id FROM actors WHERE actor_name='Shameik Moore')),
((SELECT id FROM movies WHERE movie_name='Spider-Man: Un nuevo universo'), (SELECT id FROM actors WHERE actor_name='Jake Johnson')),
((SELECT id FROM movies WHERE movie_name='Your Name.'), (SELECT id FROM actors WHERE actor_name='Ryunosuke Kamiki')),
((SELECT id FROM movies WHERE movie_name='Your Name.'), (SELECT id FROM actors WHERE actor_name='Mone Kamishiraishi')),
((SELECT id FROM movies WHERE movie_name='Toy Story'), (SELECT id FROM actors WHERE actor_name='Tom Hanks')),
((SELECT id FROM movies WHERE movie_name='Toy Story'), (SELECT id FROM actors WHERE actor_name='Tim Allen')),
((SELECT id FROM movies WHERE movie_name='Hereditary'), (SELECT id FROM actors WHERE actor_name='Toni Collette')),
((SELECT id FROM movies WHERE movie_name='Hereditary'), (SELECT id FROM actors WHERE actor_name='Alex Wolff')),
((SELECT id FROM movies WHERE movie_name='The Grand Budapest Hotel'), (SELECT id FROM actors WHERE actor_name='Ralph Fiennes')),
((SELECT id FROM movies WHERE movie_name='The Grand Budapest Hotel'), (SELECT id FROM actors WHERE actor_name='Tony Revolori')),
((SELECT id FROM movies WHERE movie_name='The Batman'), (SELECT id FROM actors WHERE actor_name='Robert Pattinson')),
((SELECT id FROM movies WHERE movie_name='The Batman'), (SELECT id FROM actors WHERE actor_name='Zoë Kravitz')),
((SELECT id FROM movies WHERE movie_name='Coco'), (SELECT id FROM actors WHERE actor_name='Anthony Gonzalez')),
((SELECT id FROM movies WHERE movie_name='Coco'), (SELECT id FROM actors WHERE actor_name='Gael García Bernal')),
((SELECT id FROM movies WHERE movie_name='Mad Max: Furia en la carretera'), (SELECT id FROM actors WHERE actor_name='Tom Hardy')),
((SELECT id FROM movies WHERE movie_name='Mad Max: Furia en la carretera'), (SELECT id FROM actors WHERE actor_name='Charlize Theron'));

-- 9. Reseñas (solo sobre películas aprobadas; un usuario no reseña la misma película dos veces)
INSERT INTO reviews (user_id, movie_id, title, comment, rating) VALUES
((SELECT id FROM users WHERE username='ana_lopez'),    (SELECT id FROM movies WHERE movie_name='Interstellar'), 'Una experiencia enorme', 'Mezcla ciencia y emoción sin perder el ritmo. La música se queda contigo mucho después de salir de la sala.', 9),
((SELECT id FROM users WHERE username='luis_garcia'),  (SELECT id FROM movies WHERE movie_name='Interstellar'), 'Ambiciosa pero desigual', 'Visualmente impresionante, aunque algunos diálogos explican demasiado lo que ya se ve en pantalla.', 8),
((SELECT id FROM users WHERE username='sofia_mendez'), (SELECT id FROM movies WHERE movie_name='Interstellar'), 'Me dejó sin aliento', 'La parte final es de las más intensas que he visto en cine de ciencia ficción.', 10),
((SELECT id FROM users WHERE username='carlos_ruiz'),  (SELECT id FROM movies WHERE movie_name='The Dark Knight'), 'El mejor villano', 'Heath Ledger le da al Joker una dimensión que pocas películas de superhéroes logran.', 10),
((SELECT id FROM users WHERE username='ana_lopez'),    (SELECT id FROM movies WHERE movie_name='The Dark Knight'), 'Tensión de principio a fin', 'Cada escena tiene un propósito y el ritmo nunca baja, aunque dura más de dos horas y media.', 9),
((SELECT id FROM users WHERE username='maria_torres'), (SELECT id FROM movies WHERE movie_name='Spirited Away'), 'Un mundo que se queda', 'Cada personaje tiene algo que contar. Terminé la película con ganas de volver a verla.', 10),
((SELECT id FROM users WHERE username='luis_garcia'),  (SELECT id FROM movies WHERE movie_name='Spirited Away'), 'Hermosa y extraña', 'La animación es preciosa y el ambiente del lugar es muy original.', 9),
((SELECT id FROM users WHERE username='sofia_mendez'), (SELECT id FROM movies WHERE movie_name='Blade Runner 2049'), 'Lenta pero hipnótica', 'La fotografía es espectacular, aunque cuesta un poco entrar en el ritmo.', 8),
((SELECT id FROM users WHERE username='carlos_ruiz'),  (SELECT id FROM movies WHERE movie_name='Blade Runner 2049'), 'Demasiado larga', 'Buenas ideas y actuaciones, pero le sobra media hora.', 7),
((SELECT id FROM users WHERE username='ana_lopez'),    (SELECT id FROM movies WHERE movie_name='Pulp Fiction'), 'Un clásico que sigue fresco', 'Los diálogos son ingeniosos y la estructura desordenada funciona muy bien.', 9),
((SELECT id FROM users WHERE username='maria_torres'), (SELECT id FROM movies WHERE movie_name='Pulp Fiction'), 'Divertida y violenta', 'No es para todos, pero tiene un ritmo y un humor que la hacen única.', 8),
((SELECT id FROM users WHERE username='luis_garcia'),  (SELECT id FROM movies WHERE movie_name='The Shining'), 'Inquietante de principio a fin', 'La atmósfera del hotel vacío es perfecta para generar miedo.', 9),
((SELECT id FROM users WHERE username='sofia_mendez'), (SELECT id FROM movies WHERE movie_name='The Shining'), 'Terror lento', 'Algunas escenas se alargan, pero el final es memorable.', 8),
((SELECT id FROM users WHERE username='carlos_ruiz'),  (SELECT id FROM movies WHERE movie_name='Spider-Man: Un nuevo universo'), 'Visualmente innovadora', 'El estilo de animación es distinto a todo lo que se había visto en una película de superhéroes.', 9),
((SELECT id FROM users WHERE username='maria_torres'), (SELECT id FROM movies WHERE movie_name='Spider-Man: Un nuevo universo'), 'Un gran equipo de héroes', 'Los personajes secundarios son tan buenos como el protagonista.', 10),
((SELECT id FROM users WHERE username='ana_lopez'),    (SELECT id FROM movies WHERE movie_name='Your Name.'), 'Emotiva y original', 'La historia tiene giros inesperados y un final que emociona.', 9),
((SELECT id FROM users WHERE username='sofia_mendez'), (SELECT id FROM movies WHERE movie_name='Your Name.'), 'Bonita pero predecible', 'Disfruté la animación, aunque la trama se vuelve previsible en la segunda mitad.', 8),
((SELECT id FROM users WHERE username='luis_garcia'),  (SELECT id FROM movies WHERE movie_name='Toy Story'), 'Clásico de la infancia', 'Sigue funcionando para cualquier edad. El humor se mantiene.', 8),
((SELECT id FROM users WHERE username='carlos_ruiz'),  (SELECT id FROM movies WHERE movie_name='Akira'), 'Un referente', 'La animación todavía impresiona, aunque la trama es difícil de seguir la primera vez.', 7),
((SELECT id FROM users WHERE username='maria_torres'), (SELECT id FROM movies WHERE movie_name='Hereditary'), 'Pesadilla bien construida', 'Tiene escenas muy perturbadoras, pero el guion se desinfla un poco al final.', 6),
((SELECT id FROM users WHERE username='sofia_mendez'), (SELECT id FROM movies WHERE movie_name='The Grand Budapest Hotel'), 'Encantadora', 'Cada plano parece una postal. Es divertida sin dejar de ser melancólica.', 9),
((SELECT id FROM users WHERE username='ana_lopez'),    (SELECT id FROM movies WHERE movie_name='The Grand Budapest Hotel'), 'Muy bien dirigida', 'El estilo visual es inconfundible y el reparto está en su mejor forma.', 8);

-- 10. Reacciones (likes y dislikes). Nadie reacciona a su propia reseña.
INSERT INTO user_reactions (user_id, review_id, reaction) VALUES
((SELECT id FROM users WHERE username='luis_garcia'),  (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='ana_lopez' AND m.movie_name='Interstellar'), 'like'),
((SELECT id FROM users WHERE username='sofia_mendez'), (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='ana_lopez' AND m.movie_name='Interstellar'), 'like'),
((SELECT id FROM users WHERE username='carlos_ruiz'),  (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='ana_lopez' AND m.movie_name='Interstellar'), 'like'),
((SELECT id FROM users WHERE username='maria_torres'), (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='ana_lopez' AND m.movie_name='Interstellar'), 'dislike'),
((SELECT id FROM users WHERE username='maria_torres'), (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='carlos_ruiz' AND m.movie_name='The Dark Knight'), 'like'),
((SELECT id FROM users WHERE username='luis_garcia'),  (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='ana_lopez' AND m.movie_name='The Dark Knight'), 'dislike'),
((SELECT id FROM users WHERE username='sofia_mendez'), (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='carlos_ruiz' AND m.movie_name='Blade Runner 2049'), 'like'),
((SELECT id FROM users WHERE username='ana_lopez'),    (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='carlos_ruiz' AND m.movie_name='Blade Runner 2049'), 'dislike'),
((SELECT id FROM users WHERE username='luis_garcia'),  (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='maria_torres' AND m.movie_name='Pulp Fiction'), 'like'),
((SELECT id FROM users WHERE username='carlos_ruiz'),  (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='maria_torres' AND m.movie_name='Pulp Fiction'), 'dislike'),
((SELECT id FROM users WHERE username='carlos_ruiz'),  (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='luis_garcia' AND m.movie_name='Spirited Away'), 'like'),
((SELECT id FROM users WHERE username='maria_torres'), (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='luis_garcia' AND m.movie_name='Spirited Away'), 'like'),
((SELECT id FROM users WHERE username='ana_lopez'),    (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='maria_torres' AND m.movie_name='Hereditary'), 'dislike'),
((SELECT id FROM users WHERE username='luis_garcia'),  (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='sofia_mendez' AND m.movie_name='The Shining'), 'like'),
((SELECT id FROM users WHERE username='carlos_ruiz'),  (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='sofia_mendez' AND m.movie_name='The Shining'), 'dislike'),
((SELECT id FROM users WHERE username='ana_lopez'),    (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='carlos_ruiz' AND m.movie_name='Spider-Man: Un nuevo universo'), 'like'),
((SELECT id FROM users WHERE username='sofia_mendez'), (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='maria_torres' AND m.movie_name='Spider-Man: Un nuevo universo'), 'like'),
((SELECT id FROM users WHERE username='maria_torres'), (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='sofia_mendez' AND m.movie_name='Your Name.'), 'like'),
((SELECT id FROM users WHERE username='ana_lopez'),    (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='luis_garcia' AND m.movie_name='Toy Story'), 'dislike'),
((SELECT id FROM users WHERE username='luis_garcia'),  (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='carlos_ruiz' AND m.movie_name='Akira'), 'like'),
((SELECT id FROM users WHERE username='carlos_ruiz'),  (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='ana_lopez' AND m.movie_name='The Grand Budapest Hotel'), 'like'),
((SELECT id FROM users WHERE username='sofia_mendez'), (SELECT r.id FROM reviews r JOIN users u ON u.id=r.user_id JOIN movies m ON m.id=r.movie_id WHERE u.username='ana_lopez' AND m.movie_name='The Grand Budapest Hotel'), 'like');

-- 11. Contadores derivados: se calculan desde las tablas para que siempre coincidan
UPDATE reviews r SET
  r.likes    = (SELECT COUNT(*) FROM user_reactions ur WHERE ur.review_id = r.id AND ur.reaction = 'like'),
  r.dislikes = (SELECT COUNT(*) FROM user_reactions ur WHERE ur.review_id = r.id AND ur.reaction = 'dislike');

UPDATE movies m SET
  m.rating_sum   = (SELECT COALESCE(SUM(r.rating), 0) FROM reviews r WHERE r.movie_id = m.id),
  m.rating_count = (SELECT COUNT(*) FROM reviews r WHERE r.movie_id = m.id);