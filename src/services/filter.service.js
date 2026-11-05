import db from '../config/db.js';
import MovieDto from '../dtos/movie.dto.js';
import { ApiError } from '../middlewares/error.middleware.js';
import { MOVIE_STATUS } from '../utils/constants.js';

export default class MoviesService {
    constructor() {
      this.rankingService = new RankingService();
    }


    async list({ categoryId, sort = 'ranking' } = {}) {
        if (sort === 'ranking') return this.rankingService.list({ categoryId });
        const orderBy = {
          popular: 'rating_sum DESC',

    
        }[sort];
        if (!orderBy) throw new ApiError(400, 'Unsupported sort order');

        const [rows] = await db.execute(
          `SELECT m.*, CASE WHEN m.rating_count = 0 THEN 0 ELSE m.rating_sum / m.rating_count END AS average_rating
           FROM movies m WHERE m.status = ? ${categoryFilter} ORDER BY ${orderBy}`,
          [MOVIE_STATUS.APPROVED, ...values],
        );
        return rows;
      }
}