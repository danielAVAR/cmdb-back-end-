import { Router } from 'express';
import { actors, directors, replaceMovieActors, replaceMovieDirectors } from '../controllers/people.controller.js';
import auth from '../middlewares/auth.middleware.js';
import requireRole from '../middlewares/role.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  actorInputValidator, actorLinksValidator, actorUpdateValidator,
  directorInputValidator, directorLinksValidator, directorUpdateValidator,
  movieIdParamValidator, personIdValidator,
} from '../validators/people.validator.js';

const router = Router();
const admin = [auth, requireRole('administrator')];

router.get('/actors', actors.list);
router.get('/actors/:id', personIdValidator, validate, actors.get);
router.post('/actors', ...admin, actorInputValidator, validate, actors.create);
router.put('/actors/:id', ...admin, actorUpdateValidator, validate, actors.update);
router.delete('/actors/:id', ...admin, personIdValidator, validate, actors.delete);

router.get('/directors', directors.list);
router.get('/directors/:id', personIdValidator, validate, directors.get);
router.post('/directors', ...admin, directorInputValidator, validate, directors.create);
router.put('/directors/:id', ...admin, directorUpdateValidator, validate, directors.update);
router.delete('/directors/:id', ...admin, personIdValidator, validate, directors.delete);

router.put('/movies/:movieId/actors', ...admin, actorLinksValidator, validate, replaceMovieActors);
router.put('/movies/:movieId/directors', ...admin, directorLinksValidator, validate, replaceMovieDirectors);

export default router;
