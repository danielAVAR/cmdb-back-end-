import db from '../config/db.js';
import { ApiError } from '../middlewares/error.middleware.js';
import CategoryDto from '../dtos/category.dto.js';

export default class CategoryService {
  async list() {
    const [rows] = await db.query('SELECT id, category_name FROM categories ORDER BY category_name');
    return rows;
  }

  async get(id) {
    const [rows] = await db.execute('SELECT id, category_name FROM categories WHERE id = ?', [id]);
    if (!rows[0]) throw new ApiError(404, 'Category not found');
    return rows[0];
  }

  async create(data) {
    const dto = new CategoryDto(data);
    const [result] = await db.execute('INSERT INTO categories (category_name) VALUES (?)', [dto.categoryName]);
    return this.get(result.insertId);
  }

  async update(id, data) {
    await this.get(id);
    const dto = new CategoryDto(data);
    await db.execute('UPDATE categories SET category_name = ? WHERE id = ?', [dto.categoryName, id]);
    return this.get(id);
  }

  async delete(id) {
    await this.get(id);
    await db.execute('DELETE FROM categories WHERE id = ?', [id]);
  }
}
