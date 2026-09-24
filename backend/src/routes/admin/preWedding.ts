import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index.js';
import type { PreWeddingPageData } from '../../db/types.js';

export const adminPreWeddingRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/pre-wedding
  fastify.get(
    '/pre-wedding',
    { preHandler: [fastify.authenticate] },
    async () => {
      const data = db.preWedding.get();
      return {
        success: true,
        data,
      };
    }
  );

  // PUT /api/admin/pre-wedding
  fastify.put<{
    Body: Partial<PreWeddingPageData>;
  }>(
    '/pre-wedding',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' && user.role !== 'EDITOR') {
        return reply.code(403).send({
          success: false,
          message: 'Permission denied. You do not have permissions to modify Pre-Wedding Studio content.',
        });
      }
      const updates = request.body;

      const updated = await db.preWedding.update(updates);

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'UPDATE_PRE_WEDDING_STUDIO',
        entityType: 'PreWeddingStudio',
        entityId: 'pre-wedding-singleton',
        details: { message: 'Updated pre-wedding packages and studio settings' },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.send({
        success: true,
        data: updated,
        message: 'Pre-Wedding Studio packages and settings updated successfully.',
      });
    }
  );
};
