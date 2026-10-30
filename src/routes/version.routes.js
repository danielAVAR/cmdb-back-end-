import { Router } from 'express';
import { getVersion } from '../controllers/version.controller.js';

const router = Router();

// queda como GET /api/v1/version porque routes/index.js monta este router bajo /api/v1
router.get('/version', getVersion);

export default router;