import PeopleService from '../services/people.service.js';

const people = new PeopleService();

const createHandlers = (type) => ({
  list: async (req, res, next) => {
    try { res.json({ success: true, data: await people.list(type) }); }
    catch (error) { next(error); }
  },
  get: async (req, res, next) => {
    try { res.json({ success: true, data: await people.get(type, Number(req.params.id)) }); }
    catch (error) { next(error); }
  },
  create: async (req, res, next) => {
    try { res.status(201).json({ success: true, data: await people.create(type, req.body) }); }
    catch (error) { next(error); }
  },
  update: async (req, res, next) => {
    try { res.json({ success: true, data: await people.update(type, Number(req.params.id), req.body) }); }
    catch (error) { next(error); }
  },
  delete: async (req, res, next) => {
    try {
      await people.delete(type, Number(req.params.id));
      res.status(204).end();
    } catch (error) { next(error); }
  },
});

export const actors = createHandlers('actors');
export const directors = createHandlers('directors');

export const replaceMovieActors = async (req, res, next) => {
  try {
    const data = await people.replaceMoviePeople('actors', Number(req.params.movieId), req.body.actorIds);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const replaceMovieDirectors = async (req, res, next) => {
  try {
    const data = await people.replaceMoviePeople('directors', Number(req.params.movieId), req.body.directorIds);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
