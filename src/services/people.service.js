import db from '../config/db.js';
import ActorDto from '../dtos/actor.dto.js';
import DirectorDto from '../dtos/director.dto.js';
import MovieActorDto from '../dtos/movie-actor.dto.js';
import MovieDirectorDto from '../dtos/movie-director.dto.js';
import { ApiError } from '../middlewares/error.middleware.js';

const PEOPLE = Object.freeze({
  actors: { table: 'actors', relation: 'movie_actors', foreignKey: 'actor_id', Dto: ActorDto, LinkDto: MovieActorDto, personField: 'actorId' },
  directors: { table: 'directors', relation: 'movie_directors', foreignKey: 'director_id', Dto: DirectorDto, LinkDto: MovieDirectorDto, personField: 'directorId' },
});

export default class PeopleService {
  #config(type) {
    const config = PEOPLE[type];
    if (!config) throw new ApiError(404, 'People resource not found');
    return config;
  }

  async list(type) {
    const { table } = this.#config(type);
    const [rows] = await db.query(`SELECT * FROM ${table} ORDER BY id`);
    return rows;
  }

  async get(type, id) {
    const { table } = this.#config(type);
    const [rows] = await db.execute(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    if (!rows[0]) throw new ApiError(404, 'Person not found');
    return rows[0];
  }

  async create(type, data) {
    const config = this.#config(type);
    const dto = new config.Dto(data);
    const values = Object.fromEntries(
      Object.entries(this.#personValues(type, dto)).filter(([, value]) => value !== undefined),
    );
    const columns = Object.keys(values);
    const [result] = await db.execute(
      `INSERT INTO ${config.table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
      Object.values(values),
    );
    return this.get(type, result.insertId);
  }

  async update(type, id, data) {
    const config = this.#config(type);
    await this.get(type, id);
    const dto = new config.Dto(data);
    const values = Object.fromEntries(Object.entries(this.#personValues(type, dto)).filter(([, value]) => value !== undefined));
    const columns = Object.keys(values);
    if (columns.length) {
      await db.execute(
        `UPDATE ${config.table} SET ${columns.map((column) => `${column} = ?`).join(', ')} WHERE id = ?`,
        [...Object.values(values), id],
      );
    }
    return this.get(type, id);
  }

  async delete(type, id) {
    const { table } = this.#config(type);
    await this.get(type, id);
    await db.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
  }

  async replaceMoviePeople(type, movieId, personIds) {
    const { relation, foreignKey, LinkDto, personField } = this.#config(type);
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [movies] = await connection.execute('SELECT id FROM movies WHERE id = ? FOR UPDATE', [movieId]);
      if (!movies[0]) throw new ApiError(404, 'Movie not found');
      await connection.execute(`DELETE FROM ${relation} WHERE movie_id = ?`, [movieId]);
      for (const personId of [...new Set(personIds)]) {
        const link = new LinkDto({ movieId, [personField]: personId });
        await connection.execute(`INSERT INTO ${relation} (movie_id, ${foreignKey}) VALUES (?, ?)`, [link.movieId, link[personField]]);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return this.getMoviePeople(type, movieId);
  }

  async getMoviePeople(type, movieId) {
    const { table, relation, foreignKey } = this.#config(type);
    const [rows] = await db.execute(
      `SELECT p.* FROM ${table} p JOIN ${relation} mp ON mp.${foreignKey} = p.id WHERE mp.movie_id = ? ORDER BY p.id`,
      [movieId],
    );
    return rows;
  }

  #personValues(type, dto) {
    if (type === 'actors') {
      return { actor_name: dto.actorName, biography: dto.biography, birthdate: dto.birthdate };
    }
    return { director_name: dto.directorName, biography: dto.biography };
  }
}
