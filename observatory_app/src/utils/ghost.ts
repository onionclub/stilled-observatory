import GhostAdminAPI from '@tryghost/admin-api';

// Instantiates the Ghost Admin API Client using environment variables.
// These variables should be placed in `.env` for local development
// and within the hosting provider's environment variables dashboard for production.

export const getGhostAdmin = () => {
    return new GhostAdminAPI({
        // url is the Ghost instance url, e.g. https://admin.stilled.xyz
        url: import.meta.env.GHOST_URL || 'http://localhost:2368',
        // key format is {id}:{secret}
        key: import.meta.env.GHOST_ADMIN_API_KEY || '1ea31a0e051c045b0a3c9be0:1ea31a0e051c045b0a3c9be01ea31a0e051c045b0a3c9be01',
        version: 'v5.0'
    });
};

export const SCRATCHPAD_SLUG = 'observatory-scratchpad';
