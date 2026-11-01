import db from '../config/db.js';
import { MOVIE_STATUS } from '../utils/constants.js';

export default class RankingService {
  async list({ categoryId } = {}) {
    const values = [];
    let categoryFilter = '';
    if (categoryId) {
      categoryFilter = 'AND EXISTS (SELECT 1 FROM movie_categories mc WHERE mc.movie_id = m.id AND mc.category_id = ?)';
      values.push(categoryId);
    }
    const [rows] = await db.execute(
      `SELECT m.*,
        CASE WHEN m.rating_count = 0 THEN 0 ELSE m.rating_sum / m.rating_count END AS average_rating,
        ((m.rating_sum + 25) / (m.rating_count + 5)) +
        CASE WHEN COALESCE(rs.engagement, 0) = 0 THEN 0
             ELSE 2 * COALESCE(rs.engagement, 0) / (5 + ABS(COALESCE(rs.engagement, 0))) END AS ranking_score
       FROM movies m
       LEFT JOIN (
         SELECT movie_id, SUM((likes - dislikes) * EXP(-GREATEST(DATEDIFF(CURRENT_DATE, DATE(created_at)), 0) / 180)) AS engagement
         FROM reviews GROUP BY movie_id
       ) rs ON rs.movie_id = m.id
       WHERE m.status = ? ${categoryFilter}
       ORDER BY ranking_score DESC, m.rating_count DESC, m.movie_name ASC`,
      [MOVIE_STATUS.APPROVED, ...values],
    );
    return rows;
  }
}
