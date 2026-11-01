import { Router } from 'express';
import { createCategory, deleteCategory, getCategory, listCategories, updateCategory } from '../controllers/categories.controller.js';
import auth from '../middlewares/auth.middleware.js';
import requireRole from '../middlewares/role.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { categoryIdValidator, createCategoryValidator, updateCategoryValidator } from '../validators/categories.validator.js';

const router = Router();

router.get('/', listCategories);
router.get('/:id', categoryIdValidator, validate, getCategory);
router.post('/', auth, requireRole('administrator'), createCategoryValidator, validate, createCategory);
router.put('/:id', auth, requireRole('administrator'), updateCategoryValidator, validate, updateCategory);
router.delete('/:id', auth, requireRole('administrator'), categoryIdValidator, validate, deleteCategory);

export default router;
