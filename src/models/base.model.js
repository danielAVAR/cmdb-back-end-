
export default class BaseModel {
  #dbConn;
  #table;
  constructor( repo, dbConnection ){
    this.#dbConn = dbConnection;
    this.#table = repo;
  }

  get table(){ return this.#table };
  get dbConn(){ return this.#dbConn };

  #assertFields(fields) {
    if (!fields.length || fields.some((field) => !/^[a-z_]+$/.test(field))) {
      throw new TypeError('Invalid database field');
    }
  }

  async create(data) {
    const fields = Object.keys(data);
    this.#assertFields(fields);
    const sql = `INSERT INTO ${this.#table} (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;
    const [result] = await this.#dbConn.execute(sql, fields.map((field) => data[field]));
    return result.insertId;
  }

  async getAll() {
    const [rows] = await this.#dbConn.query(`SELECT * FROM ${this.#table}`);
    return rows;
  }

  async getById(id) {
    const [rows] = await this.#dbConn.execute(`SELECT * FROM ${this.#table} WHERE id = ?`, [id]);
    return rows[0] || null;
  }

  async update(id, data) {
    const fields = Object.keys(data);
    this.#assertFields(fields);
    const assignments = fields.map((field) => `${field} = ?`).join(', ');
    const [result] = await this.#dbConn.execute(
      `UPDATE ${this.#table} SET ${assignments} WHERE id = ?`,
      [...fields.map((field) => data[field]), id],
    );
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await this.#dbConn.execute(`DELETE FROM ${this.#table} WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
}
