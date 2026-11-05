import 'dotenv/config';
import app from './app.js';
import db from './config/db.js';

const port = Number(process.env.PORT || process.env.APP_PORT || 3000);
try {
  await db.query('SELECT 1');
  app.listen(port, () => console.log(`CMDB API disponible en http://localhost:${port}`));
} catch (error) {
  console.error('No fue posible conectar con MySQL:', error.message);
  await db.end();
  process.exit(1);
}
