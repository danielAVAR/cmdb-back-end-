import { Router } from 'express';
import { createReview, deleteReview, getReview, listReviews, reactToReview, removeReaction, updateReview } from '../controllers/reviews.controller.js';
import auth from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createReviewValidator, listReviewsValidator, reactionValidator, reviewIdValidator, updateReviewValidator } from '../validators/review.validator.js';

const router = Router();

router.get('/', listReviewsValidator, validate, listReviews);
router.get('/:id', reviewIdValidator, validate, getReview);
router.post('/', auth, createReviewValidator, validate, createReview);
router.put('/:id', auth, updateReviewValidator, validate, updateReview);
router.delete('/:id', auth, reviewIdValidator, validate, deleteReview);
router.put('/:id/reaction', auth, reactionValidator, validate, reactToReview);
router.delete('/:id/reaction', auth, reviewIdValidator, validate, removeReaction);

export default router;
