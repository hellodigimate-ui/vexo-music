import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index.js';
import type { SiteSettings } from '../../db/types.js';

export const adminSiteSettingsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/site-settings
  fastify.get(
    '/site-settings',
    { preHandler: [fastify.authenticate] },
    async () => {
      const data = db.siteSettings.get();
      return {
        success: true,
        data,
      };
    }
  );

  // PUT /api/admin/site-settings
  fastify.put<{
    Body: Partial<SiteSettings>;
  }>(
    '/site-settings',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
        return reply.code(403).send({
          success: false,
          message: 'Only Administrators can modify global site settings.',
        });
      }
      const updates = request.body;

      const updated = db.siteSettings.update(updates);

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'UPDATE_SITE_SETTINGS',
        entityType: 'SiteSettings',
        entityId: 'site-settings-singleton',
        details: { updates },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.send({
        success: true,
        data: updated,
        message: 'Global site settings updated successfully.',
      });
    }
  );
};
