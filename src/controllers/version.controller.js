import { createRequire } from 'node:module';

// la version sale de package.json, que debe seguir semver (HU-31)
const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

// GET /api/v1/version
export const getVersion = (req, res) => {
    res.status(200).json({
        success: true,
        data: { version },
    });
};