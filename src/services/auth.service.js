import bcrypt from 'bcrypt';
import db from '../config/db.js';
import { signToken } from '../utils/token.js';
import { ApiError } from '../middlewares/error.middleware.js';
import UserDto from '../dtos/user.dto.js';

export default class AuthService {
  async register(data) {
    const dto = new UserDto(data);
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [dto.username, dto.email, passwordHash],
    );
    const [rows] = await db.execute(
      'SELECT id, username, email, administrator, created_at FROM users WHERE id = ?',
      [result.insertId],
    );
    return rows[0];
  }

  async login({ email, password }) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    return {
      token: signToken({ sub: user.id, administrator: Boolean(user.administrator) }),
      user: this.#publicUser(user),
    };
  }

  async getUserById(id) {
    const [rows] = await db.execute(
      'SELECT id, username, email, administrator, created_at FROM users WHERE id = ?',
      [id],
    );
    if (!rows[0]) throw new ApiError(404, 'User not found');
    return this.#publicUser(rows[0]);
  }

  #publicUser(user) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      administrator: Boolean(user.administrator),
      created_at: user.created_at,
    };
  }
}
