import { createRequire } from 'node:module';
import semver from 'semver';

// the API version comes from package.json and must follow semver (HU-31)
const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

if (!semver.valid(version)) {
    throw new Error(`package.json version "${version}" is not a valid semver version`);
}

export const apiVersion = semver.clean(version);
