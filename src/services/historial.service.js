import db from '../config/db.js';

export default class HistorialService {
    async getByUser(userId, filters = {}) {
        let sql = `SELECT id, user_id, action_type, description, review_id, created_at
                FROM historial WHERE user_id = ?`;
    const params = [userId];

    if (filters.action_type) {
        sql += ` AND action_type = ?`;
        params.push(filters.action_type);
    }

    if (filters.date) {
        sql += ` AND DATE(created_at) = ?`;
        params.push(filters.date);
    }

    sql += ` ORDER BY created_at DESC`;

    const [rows] = await db.execute(sql, params);
    return rows;
    }
}
