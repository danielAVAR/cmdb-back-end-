import HistorialService from '../services/historial.service.js';

const historialService = new HistorialService();

export const getUserHistorial = async (req, res, next) => {
    try {
        const filters = {
        action_type: req.query.action_type,
        date: req.query.date,
    };
    const data = await historialService.getByUser(req.user.id, filters);
    res.json({ success: true, data });
    } catch (error) {
    next(error);
    }
};
