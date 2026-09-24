import type { FastifyPluginAsync } from 'fastify';
import { isPostgresConnected } from '../db/postgres.js';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      service: 'VEXO Music Entertainment API',
      version: '1.0.0',
      database: isPostgresConnected() ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });
};
