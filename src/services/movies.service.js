import db from '../config/db.js';
import MovieDto from '../dtos/movie.dto.js';
import MovieCategoryDto from '../dtos/movie-category.dto.js';
import { ApiError } from '../middlewares/error.middleware.js';
import RankingService from './ranking.service.js';
import { MOVIE_STATUS } from '../utils/constants.js';

export default class MoviesService {
  constructor() {
    this.rankingService = new RankingService();
  }

  async list({ categoryId, sort = 'ranking' } = {}) {
    if (sort === 'ranking') return this.rankingService.list({ categoryId });
    const orderBy = {
      popular: 'rating_count DESC, average_rating DESC',
      newest: 'created_at DESC',
      title: 'movie_name ASC',
    }[sort];
    if (!orderBy) throw new ApiError(400, 'Unsupported sort order');

    const values = [];
    let categoryFilter = '';
    if (categoryId) {
      categoryFilter = 'AND EXISTS (SELECT 1 FROM movie_categories mc WHERE mc.movie_id = m.id AND mc.category_id = ?)';
      values.push(categoryId);
    }
    const [rows] = await db.execute(
      `SELECT m.*, CASE WHEN m.rating_count = 0 THEN 0 ELSE m.rating_sum / m.rating_count END AS average_rating
       FROM movies m WHERE m.status = ? ${categoryFilter} ORDER BY ${orderBy}`,
      [MOVIE_STATUS.APPROVED, ...values],
    );
    return rows;
  }

  async listPending() {
    const [rows] = await db.execute('SELECT * FROM movies WHERE status = ? ORDER BY created_at ASC', [MOVIE_STATUS.PENDING]);
    return rows;
  }

  async get(id, viewer) {
    const [rows] = await db.execute('SELECT * FROM movies WHERE id = ?', [id]);
    const movie = rows[0];
    if (!movie) throw new ApiError(404, 'Movie not found');
    if (movie.status !== MOVIE_STATUS.APPROVED && !viewer?.administrator && Number(viewer?.id) !== movie.created_by) {
      throw new ApiError(404, 'Movie not found');
    }

    const [categories] = await db.execute(
      `SELECT c.id, c.category_name FROM categories c
       JOIN movie_categories mc ON mc.category_id = c.id WHERE mc.movie_id = ? ORDER BY c.category_name`, [id],
    );
    const [actors] = await db.execute(
      `SELECT a.id, a.actor_name, a.biography, a.birthdate FROM actors a
       JOIN movie_actors ma ON ma.actor_id = a.id WHERE ma.movie_id = ? ORDER BY a.actor_name`, [id],
    );
    const [directors] = await db.execute(
      `SELECT d.id, d.director_name, d.biography FROM directors d
       JOIN movie_directors md ON md.director_id = d.id WHERE md.movie_id = ? ORDER BY d.director_name`, [id],
    );
    const [reviews] = await db.execute(
      `SELECT r.id, r.user_id, u.username, r.movie_id, r.title, r.comment, r.rating,
              r.likes, r.dislikes, r.created_at, r.updated_at
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.movie_id = ? ORDER BY r.created_at DESC`, [id],
    );
    return { ...movie, categories, actors, directors, reviews };
  }

  async create(data, userId) {
    const dto = new MovieDto(data);
    const categoryIds = [...new Set(data.categoryIds)];
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(
        `INSERT INTO movies (movie_name, overview, release_year, image_url, runtime, budget, gross_worldwide, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [dto.movieName, dto.overview, dto.releaseYear, dto.imageUrl ?? null, dto.runtime ?? null,
          dto.budget ?? null, dto.grossWorldwide ?? null, userId],
      );
      for (const categoryId of categoryIds) {
        const relation = new MovieCategoryDto({ movieId: result.insertId, categoryId });
        await connection.execute('INSERT INTO movie_categories (movie_id, category_id) VALUES (?, ?)', [relation.movieId, relation.categoryId]);
      }
      await connection.commit();
      return this.get(result.insertId, { id: userId });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async update(id, data, user) {
    await this.#assertCanManage(id, user);
    const dto = new MovieDto(data);
    const fields = {
      movie_name: dto.movieName,
      overview: dto.overview,
      release_year: dto.releaseYear,
      image_url: dto.imageUrl,
      runtime: dto.runtime,
      budget: dto.budget,
      gross_worldwide: dto.grossWorldwide,
    };
    const changes = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      if (Object.keys(changes).length) {
        const names = Object.keys(changes);
        await connection.execute(
          `UPDATE movies SET ${names.map((name) => `${name} = ?`).join(', ')} WHERE id = ?`,
          [...Object.values(changes), id],
        );
      }
      if (data.categoryIds !== undefined) {
        await connection.execute('DELETE FROM movie_categories WHERE movie_id = ?', [id]);
        for (const categoryId of [...new Set(data.categoryIds)]) {
          const relation = new MovieCategoryDto({ movieId: id, categoryId });
          await connection.execute('INSERT INTO movie_categories (movie_id, category_id) VALUES (?, ?)', [relation.movieId, relation.categoryId]);
        }
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return this.get(id, user);
  }

  async approve(id) {
    const [rows] = await db.execute('SELECT id FROM movies WHERE id = ?', [id]);
    if (!rows[0]) throw new ApiError(404, 'Movie not found');
    await db.execute('UPDATE movies SET status = ? WHERE id = ?', [MOVIE_STATUS.APPROVED, id]);
    return this.get(id, { administrator: true });
  }

  async delete(id, user) {
    await this.#assertCanManage(id, user);
    await db.execute('DELETE FROM movies WHERE id = ?', [id]);
  }

  async #assertCanManage(id, user) {
    const [rows] = await db.execute('SELECT id, created_by FROM movies WHERE id = ?', [id]);
    if (!rows[0]) throw new ApiError(404, 'Movie not found');
    if (!user.administrator && Number(user.id) !== rows[0].created_by) throw new ApiError(403, 'Forbidden');
  }
}
