import { Router } from 'express';
import { getCurrentUser, login, register } from '../controllers/auth.controller.js';
import auth from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { loginValidator, registerValidator } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/me', auth, getCurrentUser);

export default router;
