import { Router } from 'express';
import authRoutes from './auth.routes.js';
import categoriesRoutes from './categories.routes.js';
import moviesRoutes from './movies.routes.js';
import peopleRoutes from './people.routes.js';
import reviewsRoutes from './reviews.routes.js';
import versionRoutes from './version.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoriesRoutes);
router.use('/movies', moviesRoutes);
router.use('/people', peopleRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/', versionRoutes);

export default router;
