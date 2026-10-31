import MoviesService from '../services/movies.service.js';

const movies = new MoviesService();

export const listMovies = async (req, res, next) => {
  try {
    const data = await movies.list({ categoryId: req.query.categoryId, sort: req.query.sort || 'ranking' });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const listPendingMovies = async (req, res, next) => {
  try { res.json({ success: true, data: await movies.listPending() }); }
  catch (error) { next(error); }
};

export const getMovie = async (req, res, next) => {
  try { res.json({ success: true, data: await movies.get(Number(req.params.id), req.user) }); }
  catch (error) { next(error); }
};

export const createMovie = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await movies.create(req.body, req.user.id) }); }
  catch (error) { next(error); }
};

export const updateMovie = async (req, res, next) => {
  try { res.json({ success: true, data: await movies.update(Number(req.params.id), req.body, req.user) }); }
  catch (error) { next(error); }
};

export const approveMovie = async (req, res, next) => {
  try { res.json({ success: true, data: await movies.approve(Number(req.params.id)) }); }
  catch (error) { next(error); }
};

export const deleteMovie = async (req, res, next) => {
  try {
    await movies.delete(Number(req.params.id), req.user);
    res.status(204).end();
  } catch (error) { next(error); }
};
