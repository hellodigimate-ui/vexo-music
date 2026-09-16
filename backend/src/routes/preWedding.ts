import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';

export const publicPreWeddingRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/pre-wedding
  fastify.get('/pre-wedding', async () => {
    return {
      success: true,
      data: db.preWedding.get(),
    };
  });
};
