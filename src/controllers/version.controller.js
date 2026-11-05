import { apiVersion } from '../utils/version.js';

// GET /api/v1/version
export const getVersion = (req, res) => {
    res.status(200).json({
        success: true,
        data: { version: apiVersion },
    });
};
