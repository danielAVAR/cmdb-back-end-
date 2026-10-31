import db from '../config/db.js';
import ReviewDto from '../dtos/review.dto.js';
import { ApiError } from '../middlewares/error.middleware.js';

export default class ReviewsService {
  async list(movieId) {
    const sql = `SELECT r.id, r.user_id, u.username, r.movie_id, r.title, r.comment, r.rating,
                        r.likes, r.dislikes, r.created_at, r.updated_at
                 FROM reviews r JOIN users u ON u.id = r.user_id
                 JOIN movies m ON m.id = r.movie_id
                 WHERE m.status = 'approved' ${movieId ? 'AND r.movie_id = ?' : ''}
                 ORDER BY r.created_at DESC`;
    const [rows] = await db.execute(sql, movieId ? [movieId] : []);
    return rows;
  }

  async get(id) {
    const [rows] = await db.execute(
      `SELECT r.id, r.user_id, u.username, r.movie_id, r.title, r.comment, r.rating,
              r.likes, r.dislikes, r.created_at, r.updated_at
       FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.id = ?`, [id],
    );
    if (!rows[0]) throw new ApiError(404, 'Review not found');
    return rows[0];
  }

  async create(data, userId) {
    const dto = new ReviewDto(data);
    const connection = await db.getConnection();
    let reviewId;
    try {
      await connection.beginTransaction();
      const [movies] = await connection.execute("SELECT id FROM movies WHERE id = ? AND status = 'approved' FOR UPDATE", [dto.movieId]);
      if (!movies[0]) throw new ApiError(404, 'Approved movie not found');
      const [result] = await connection.execute(
        'INSERT INTO reviews (user_id, movie_id, title, comment, rating) VALUES (?, ?, ?, ?, ?)',
        [userId, dto.movieId, dto.title, dto.comment, dto.rating],
      );
      reviewId = result.insertId;
      await connection.execute('UPDATE movies SET rating_sum = rating_sum + ?, rating_count = rating_count + 1 WHERE id = ?', [dto.rating, dto.movieId]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return this.get(reviewId);
  }

  async update(id, data, user) {
    const dto = new ReviewDto(data);
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute('SELECT user_id, movie_id, rating FROM reviews WHERE id = ? FOR UPDATE', [id]);
      const old = rows[0];
      if (!old) throw new ApiError(404, 'Review not found');
      if (!user.administrator && old.user_id !== Number(user.id)) throw new ApiError(403, 'You can only edit your own reviews');

      const values = {
        title: dto.title ?? data.title,
        comment: dto.comment ?? data.comment,
        rating: dto.rating ?? data.rating,
      };
      const fields = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));
      const columns = Object.keys(fields);
      if (columns.length) {
        await connection.execute(`UPDATE reviews SET ${columns.map((field) => `${field} = ?`).join(', ')} WHERE id = ?`, [...Object.values(fields), id]);
      }
      if (fields.rating !== undefined && Number(fields.rating) !== old.rating) {
        await connection.execute('UPDATE movies SET rating_sum = rating_sum + ? WHERE id = ?', [Number(fields.rating) - old.rating, old.movie_id]);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return this.get(id);
  }

  async delete(id, user) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute('SELECT user_id, movie_id, rating FROM reviews WHERE id = ? FOR UPDATE', [id]);
      const review = rows[0];
      if (!review) throw new ApiError(404, 'Review not found');
      if (!user.administrator && review.user_id !== Number(user.id)) throw new ApiError(403, 'You can only delete your own reviews');
      await connection.execute('DELETE FROM reviews WHERE id = ?', [id]);
      await connection.execute('UPDATE movies SET rating_sum = rating_sum - ?, rating_count = rating_count - 1 WHERE id = ?', [review.rating, review.movie_id]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
