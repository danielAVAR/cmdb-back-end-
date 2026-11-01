import db from '../config/db.js';
import UserReactionDto from '../dtos/user-reaction.dto.js';
import { ApiError } from '../middlewares/error.middleware.js';

export default class VotesService {
  async setReaction(reviewId, userId, reaction) {
    const dto = new UserReactionDto({ reviewId, reaction });
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [reviews] = await connection.execute('SELECT user_id FROM reviews WHERE id = ? FOR UPDATE', [reviewId]);
      const review = reviews[0];
      if (!review) throw new ApiError(404, 'Review not found');
      if (review.user_id === Number(userId)) throw new ApiError(403, 'You cannot react to your own review');

      const [existingRows] = await connection.execute(
        'SELECT reaction FROM user_reactions WHERE user_id = ? AND review_id = ? FOR UPDATE', [userId, reviewId],
      );
      const existing = existingRows[0]?.reaction;
      if (existing === dto.reaction) {
        await connection.commit();
        return { user_id: Number(userId), review_id: Number(reviewId), reaction: existing };
      }
      if (existing) {
        await connection.execute('UPDATE user_reactions SET reaction = ? WHERE user_id = ? AND review_id = ?', [dto.reaction, userId, reviewId]);
        await connection.execute(`UPDATE reviews SET ${existing === 'like' ? 'likes = likes - 1, dislikes = dislikes + 1' : 'dislikes = dislikes - 1, likes = likes + 1'} WHERE id = ?`, [reviewId]);
      } else {
        await connection.execute('INSERT INTO user_reactions (user_id, review_id, reaction) VALUES (?, ?, ?)', [userId, reviewId, dto.reaction]);
        await connection.execute(`UPDATE reviews SET ${dto.reaction === 'like' ? 'likes = likes + 1' : 'dislikes = dislikes + 1'} WHERE id = ?`, [reviewId]);
      }
      await connection.commit();
      return { user_id: Number(userId), review_id: Number(reviewId), reaction: dto.reaction };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async removeReaction(reviewId, userId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(
        'SELECT reaction FROM user_reactions WHERE user_id = ? AND review_id = ? FOR UPDATE', [userId, reviewId],
      );
      const reaction = rows[0]?.reaction;
      if (!reaction) throw new ApiError(404, 'Reaction not found');
      await connection.execute('DELETE FROM user_reactions WHERE user_id = ? AND review_id = ?', [userId, reviewId]);
      await connection.execute(`UPDATE reviews SET ${reaction === 'like' ? 'likes = likes - 1' : 'dislikes = dislikes - 1'} WHERE id = ?`, [reviewId]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
