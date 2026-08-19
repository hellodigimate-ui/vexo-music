import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index.js';
import type { Homepage } from '../../db/types.js';

export const adminHomepageRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/homepage
  fastify.get(
    '/homepage',
    { preHandler: [fastify.authenticate] },
    async () => {
      const data = db.homepage.get();
      return {
        success: true,
        data,
      };
    }
  );

  // PUT /api/admin/homepage
  fastify.put<{
    Body: Partial<Homepage>;
  }>(
    '/homepage',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const updates = request.body;

      const updated = db.homepage.update(updates);

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'UPDATE_HOMEPAGE_CMS',
        entityType: 'Homepage',
        entityId: 'homepage-singleton',
        details: { updates },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.send({
        success: true,
        data: updated,
        message: 'Homepage CMS settings updated successfully.',
      });
    }
  );
};
