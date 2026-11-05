import express from 'express';
import cors from 'cors';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import 'dotenv/config';
import './config/passport.js';

import swaggerSpec from './config/swagger.js';
import { general } from './middlewares/rateLimit.middleware.js';
import apiRoutes from './routes/index.js';
import notFound from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// The app runs behind one reverse proxy in production (Render), which supplies
// X-Forwarded-For. Trust that hop so rate limiting uses the originating IP.
app.set('trust proxy', 1);

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(passport.initialize());
app.use(general);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1', apiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
