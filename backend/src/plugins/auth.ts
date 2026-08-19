import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { verifyJwt, type AdminTokenPayload } from '../lib/jwt.js';
import { db } from '../db/index.js';
import type { AdminUser } from '../db/types.js';

declare module 'fastify' {
  interface FastifyRequest {
    adminUser?: AdminUser;
    tokenPayload?: AdminTokenPayload;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authPluginAsync: FastifyPluginAsync = async (fastify) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'vexo-music-admin-super-secret-jwt-key-2026';

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          success: false,
          message: 'Authentication token is missing. Please provide a valid Bearer token.',
        });
      }

      const token = authHeader.substring(7).trim();
      const payload = verifyJwt(token, JWT_SECRET);

      if (!payload) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid or expired authentication token.',
        });
      }

      const user = db.adminUsers.findById(payload.userId);
      if (!user || !user.isActive) {
        return reply.code(403).send({
          success: false,
          message: 'Admin account is inactive or no longer exists.',
        });
      }

      request.adminUser = user;
      request.tokenPayload = payload;
    } catch (err: any) {
      return reply.code(401).send({
        success: false,
        message: err.message || 'Authentication failed.',
      });
    }
  });
};

export const authPlugin = fp(authPluginAsync);
