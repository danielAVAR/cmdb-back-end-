import express from 'express';
import cors from 'cors';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';

import './config/passport.js'; // registra la estrategia JWT

import swaggerSpec from './config/swagger.js';
import { general } from './middlewares/rateLimit.middleware.js';
import apiRoutes from './routes/index.js';
import notFound from './middlewares/notFound.middleware.js';
import errorHandler from './middlewares/error.middleware.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(passport.initialize());
app.use(general);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1', apiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;