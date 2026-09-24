import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';

export const publicHomepageRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/homepage
  fastify.get('/homepage', async () => {
    return {
      success: true,
      data: db.homepage.get(),
    };
  });
};
