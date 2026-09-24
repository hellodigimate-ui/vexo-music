import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';

export const publicSiteSettingsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/site-settings
  fastify.get('/site-settings', async () => {
    return {
      success: true,
      data: db.siteSettings.get(),
    };
  });
};
