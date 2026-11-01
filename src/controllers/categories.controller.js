import CategoryService from '../services/category.services.js';

const categories = new CategoryService();

export const listCategories = async (req, res, next) => {
  try { res.json({ success: true, data: await categories.list() }); }
  catch (error) { next(error); }
};

export const getCategory = async (req, res, next) => {
  try { res.json({ success: true, data: await categories.get(Number(req.params.id)) }); }
  catch (error) { next(error); }
};

export const createCategory = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await categories.create(req.body) }); }
  catch (error) { next(error); }
};

export const updateCategory = async (req, res, next) => {
  try { res.json({ success: true, data: await categories.update(Number(req.params.id), req.body) }); }
  catch (error) { next(error); }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await categories.delete(Number(req.params.id));
    res.status(204).end();
  } catch (error) { next(error); }
};
