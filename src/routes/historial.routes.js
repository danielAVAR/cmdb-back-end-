import { Router } from 'express';
import { getUserHistorial } from '../controllers/historial.controller.js';
import auth from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', auth, getUserHistorial);

export default router;
