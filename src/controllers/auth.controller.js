import AuthService from '../services/auth.service.js';

const authService = new AuthService();

export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) { next(error); }
};

export const login = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: await authService.login(req.body) });
  } catch (error) { next(error); }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) { next(error); }
};
