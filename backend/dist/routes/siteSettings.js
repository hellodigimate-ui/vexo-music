import { db } from '../db/index.js';
export const publicSiteSettingsRoutes = async (fastify) => {
    // GET /api/site-settings
    fastify.get('/site-settings', async () => {
        return {
            success: true,
            data: db.siteSettings.get(),
        };
    });
};
