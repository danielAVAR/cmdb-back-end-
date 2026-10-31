import ReviewsService from '../services/reviews.service.js';
import VotesService from '../services/votes.service.js';

const reviews = new ReviewsService();
const votes = new VotesService();

export const listReviews = async (req, res, next) => {
  try {
    const movieId = req.query.movieId ? Number(req.query.movieId) : undefined;
    res.json({ success: true, data: await reviews.list(movieId) });
  } catch (error) { next(error); }
};

export const getReview = async (req, res, next) => {
  try { res.json({ success: true, data: await reviews.get(Number(req.params.id)) }); }
  catch (error) { next(error); }
};

export const createReview = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await reviews.create(req.body, req.user.id) }); }
  catch (error) { next(error); }
};

export const updateReview = async (req, res, next) => {
  try { res.json({ success: true, data: await reviews.update(Number(req.params.id), req.body, req.user) }); }
  catch (error) { next(error); }
};

export const deleteReview = async (req, res, next) => {
  try {
    await reviews.delete(Number(req.params.id), req.user);
    res.status(204).end();
  } catch (error) { next(error); }
};

export const reactToReview = async (req, res, next) => {
  try {
    const data = await votes.setReaction(Number(req.params.id), req.user.id, req.body.reaction);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const removeReaction = async (req, res, next) => {
  try {
    await votes.removeReaction(Number(req.params.id), req.user.id);
    res.status(204).end();
  } catch (error) { next(error); }
};
