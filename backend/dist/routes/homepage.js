import { db } from '../db/index.js';
export const publicHomepageRoutes = async (fastify) => {
    // GET /api/homepage
    fastify.get('/homepage', async () => {
        return {
            success: true,
            data: db.homepage.get(),
        };
    });
};
