import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index.js';
import type { ContactRequest } from '../../db/types.js';

export const adminInquiryRoutes: FastifyPluginAsync = async (fastify) => {
  // Handler for listing enquiries
  const listHandler = async (request: any) => {
    const { status, search } = request.query || {};
    let list = db.contactRequests.findMany();

    if (status && status !== 'ALL') {
      list = list.filter((c) => c.status === status);
    }

    if (search) {
      const q = String(search).toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.service?.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q) ||
          c.message?.toLowerCase().includes(q) ||
          c.referenceId?.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      data: list,
      total: list.length,
      newCount: list.filter((c) => c.status === 'NEW').length,
    };
  };

  // GET /api/admin/inquiries & /api/admin/enquiries
  fastify.get('/inquiries', { preHandler: [fastify.authenticate] }, listHandler);
  fastify.get('/enquiries', { preHandler: [fastify.authenticate] }, listHandler);

  // Status update handler
  const updateStatusHandler = async (request: any, reply: any) => {
    const user = request.adminUser!;
    const { id } = request.params;
    const { status, notes } = request.body || {};

    const existing = db.contactRequests.findById(id);
    if (!existing) {
      return reply.code(404).send({
        success: false,
        message: `Inquiry with id '${id}' not found.`,
      });
    }

    const updates: Partial<ContactRequest> = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const updated = db.contactRequests.update(id, updates);

    db.activityLogs.log({
      adminUserId: user.id,
      adminUserName: user.name,
      action: 'UPDATE_INQUIRY_STATUS',
      entityType: 'ContactRequest',
      entityId: id,
      details: { referenceId: existing.referenceId, status, notes },
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'] || '',
    });

    return reply.send({
      success: true,
      data: updated,
      message: `Inquiry ${existing.referenceId} updated to ${status}.`,
    });
  };

  // PATCH /api/admin/inquiries/:id/status & /api/admin/enquiries/:id/status
  fastify.patch('/inquiries/:id/status', { preHandler: [fastify.authenticate] }, updateStatusHandler);
  fastify.patch('/enquiries/:id/status', { preHandler: [fastify.authenticate] }, updateStatusHandler);

  // Delete handler
  const deleteHandler = async (request: any, reply: any) => {
    const user = request.adminUser!;
    const { id } = request.params;

    const existing = db.contactRequests.findById(id);
    if (!existing) {
      return reply.code(404).send({
        success: false,
        message: `Inquiry with id '${id}' not found.`,
      });
    }

    db.contactRequests.delete(id);

    db.activityLogs.log({
      adminUserId: user.id,
      adminUserName: user.name,
      action: 'DELETE_INQUIRY',
      entityType: 'ContactRequest',
      entityId: id,
      details: { referenceId: existing.referenceId },
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'] || '',
    });

    return reply.send({
      success: true,
      message: `Inquiry ${existing.referenceId} deleted.`,
    });
  };

  // DELETE /api/admin/inquiries/:id & /api/admin/enquiries/:id
  fastify.delete('/inquiries/:id', { preHandler: [fastify.authenticate] }, deleteHandler);
  fastify.delete('/enquiries/:id', { preHandler: [fastify.authenticate] }, deleteHandler);
};
