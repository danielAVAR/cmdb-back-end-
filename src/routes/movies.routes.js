import { Router } from 'express';
import { approveMovie, createMovie, deleteMovie, getMovie, listMovies, listPendingMovies, updateMovie } from '../controllers/movies.controller.js';
import auth from '../middlewares/auth.middleware.js';
import requireRole from '../middlewares/role.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createMovieValidator, listMoviesValidator, movieIdValidator, updateMovieValidator } from '../validators/movies.validator.js';

const router = Router();

router.get('/', listMoviesValidator, validate, listMovies);
router.get('/pending', auth, requireRole('administrator'), listPendingMovies);
router.get('/:id', movieIdValidator, validate, getMovie);
router.post('/', auth, createMovieValidator, validate, createMovie);
router.put('/:id', auth, updateMovieValidator, validate, updateMovie);
router.patch('/:id/approve', auth, requireRole('administrator'), movieIdValidator, validate, approveMovie);
router.delete('/:id', auth, movieIdValidator, validate, deleteMovie);

export default router;
