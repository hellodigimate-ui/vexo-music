import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index.js';
import { hashPassword } from '../../lib/crypto.js';

export const adminUserManagementRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/users
  fastify.get(
    '/users',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const current = request.adminUser!;
      if (current.role !== 'SUPER_ADMIN' && current.role !== 'ADMIN') {
        return reply.code(403).send({
          success: false,
          message: 'Only Administrators can manage admin accounts.',
        });
      }

      const users = db.adminUsers.findMany().map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        isActive: u.isActive,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
      }));

      return {
        success: true,
        data: users,
        total: users.length,
      };
    }
  );

  // POST /api/admin/users
  fastify.post<{
    Body: {
      email: string;
      password: string;
      name: string;
      role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
    };
  }>(
    '/users',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const current = request.adminUser!;
      if (current.role !== 'SUPER_ADMIN' && current.role !== 'ADMIN') {
        return reply.code(403).send({
          success: false,
          message: 'Only Administrators can create admin accounts.',
        });
      }
      const { email, password, name, role } = request.body || {};

      if (!email || !password || !name) {
        return reply.code(400).send({
          success: false,
          message: 'Email, password, and name are required.',
        });
      }

      const existing = db.adminUsers.findByEmail(email);
      if (existing) {
        return reply.code(400).send({
          success: false,
          message: `Admin user with email '${email}' already exists.`,
        });
      }

      const created = db.adminUsers.create({
        email,
        passwordHash: hashPassword(password),
        name,
        role: role || 'ADMIN',
        isActive: true,
        lastLoginAt: null,
      });

      db.activityLogs.log({
        adminUserId: current.id,
        adminUserName: current.name,
        action: 'CREATE_ADMIN_USER',
        entityType: 'AdminUser',
        entityId: created.id,
        details: { email, role: created.role },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.code(201).send({
        success: true,
        data: {
          id: created.id,
          email: created.email,
          name: created.name,
          role: created.role,
          isActive: created.isActive,
        },
        message: `Admin user "${name}" created successfully.`,
      });
    }
  );

  // PUT /api/admin/users/:id/toggle-status
  fastify.put<{
    Params: { id: string };
  }>(
    '/users/:id/toggle-status',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const current = request.adminUser!;
      if (current.role !== 'SUPER_ADMIN' && current.role !== 'ADMIN') {
        return reply.code(403).send({
          success: false,
          message: 'Only Administrators can modify account status.',
        });
      }

      const { id } = request.params;
      if (id === current.id) {
        return reply.code(400).send({
          success: false,
          message: 'You cannot deactivate your own Super Admin account.',
        });
      }

      const target = db.adminUsers.findById(id);
      if (!target) {
        return reply.code(404).send({
          success: false,
          message: 'Admin account not found.',
        });
      }

      const updated = db.adminUsers.update(id, { isActive: !target.isActive });

      db.activityLogs.log({
        adminUserId: current.id,
        adminUserName: current.name,
        action: 'TOGGLE_ADMIN_STATUS',
        entityType: 'AdminUser',
        entityId: id,
        details: { newStatus: updated?.isActive },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.send({
        success: true,
        data: updated,
        message: `Admin user status changed to ${updated?.isActive ? 'Active' : 'Inactive'}.`,
      });
    }
  );
};
