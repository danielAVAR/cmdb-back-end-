import mysql from 'mysql2/promise';
import dotenv from 'dotenv'

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_HOST),
    database: process.env.DB_NAME,
    user: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10
});

export default db;