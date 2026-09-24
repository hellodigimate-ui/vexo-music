import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index.js';
import type { Service } from '../../db/types.js';

export const adminServiceRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/services
  fastify.get(
    '/services',
    { preHandler: [fastify.authenticate] },
    async () => {
      const services = db.services.findMany();
      return {
        success: true,
        data: services,
        total: services.length,
      };
    }
  );

  // PUT /api/admin/services/reorder
  fastify.put<{
    Body: {
      serviceIds: string[];
    };
  }>(
    '/services/reorder',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const { serviceIds } = request.body;

      if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
        return reply.code(400).send({
          success: false,
          message: 'serviceIds array is required.',
        });
      }

      const reordered = await db.services.reorder(serviceIds);

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'REORDER_SERVICES',
        entityType: 'Service',
        details: { count: serviceIds.length, serviceIds },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.send({
        success: true,
        data: reordered,
        message: 'Services reordered successfully.',
      });
    }
  );

  // POST /api/admin/services
  fastify.post<{
    Body: {
      number?: string;
      title: string;
      slug?: string;
      category?: string;
      shortDesc?: string;
      shortDescription?: string;
      fullDesc?: string;
      fullDescription?: string;
      imageUrl?: string;
      image?: string;
      icon?: string;
      features?: string[] | string;
      ctaText?: string;
      pricingRange?: string;
      specifications?: string[] | string;
      equipmentList?: string[] | string;
      order?: number;
      displayOrder?: number;
      isActive?: boolean;
      published?: boolean;
    };
  }>(
    '/services',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const body = request.body;

      const title = body.title?.trim();
      const shortDesc = (body.shortDesc || body.shortDescription || '').trim();
      const fullDesc = (body.fullDesc || body.fullDescription || shortDesc || '').trim();
      const imageUrl = (body.imageUrl || body.image || '').trim();
      const icon = (body.icon || 'Music').trim();

      if (!title || !shortDesc) {
        return reply.code(400).send({
          success: false,
          message: 'Title and short description are required.',
        });
      }

      const slug =
        body.slug?.trim() ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      const features = Array.isArray(body.features)
        ? body.features
        : typeof body.features === 'string'
          ? (body.features as string).split('\n').map((f) => f.trim()).filter(Boolean)
          : [];

      const specifications = Array.isArray(body.specifications)
        ? body.specifications
        : typeof body.specifications === 'string'
          ? (body.specifications as string).split('\n').map((f) => f.trim()).filter(Boolean)
          : [];

      const equipmentList = Array.isArray(body.equipmentList)
        ? body.equipmentList
        : typeof body.equipmentList === 'string'
          ? (body.equipmentList as string).split('\n').map((f) => f.trim()).filter(Boolean)
          : [];

      const allServices = db.services.findMany();
      const order =
        body.order !== undefined
          ? Number(body.order)
          : body.displayOrder !== undefined
            ? Number(body.displayOrder)
            : allServices.length + 1;

      const isActive =
        body.isActive !== undefined
          ? Boolean(body.isActive)
          : body.published !== undefined
            ? Boolean(body.published)
            : true;

      const number = body.number || (order < 10 ? `0${order}` : `${order}`);

      console.log("service created :", body)

      const created = await db.services.create({
        number,
        title,
        slug,
        category: body.category || 'Production',
        shortDesc,
        fullDesc: fullDesc || shortDesc,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
        icon,
        features,
        ctaText: body.ctaText || 'INITIATE PROJECT',
        pricingRange: body.pricingRange || null,
        plans: (body as any).plans || [],
        specs: (body as any).specs || specifications,
        processSteps: (body as any).processSteps || [],
        deliverables: (body as any).deliverables || [],
        faqs: (body as any).faqs || [],
        specifications,
        equipmentList,
        order,
        isActive,
      });

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'CREATE_SERVICE',
        entityType: 'Service',
        entityId: created.id,
        details: { title, slug, icon, order, isActive },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.code(201).send({
        success: true,
        data: created,
        message: `Service "${title}" created successfully.`,
      });
    }
  );

  // PATCH /api/admin/services/:id/publish
  fastify.patch<{
    Params: { id: string };
    Body: { isActive?: boolean; published?: boolean };
  }>(
    '/services/:id/publish',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const { id } = request.params;
      const existing = db.services.findById(id);

      if (!existing) {
        return reply.code(404).send({
          success: false,
          message: `Service with id '${id}' not found.`,
        });
      }

      const newStatus =
        request.body?.isActive !== undefined
          ? Boolean(request.body.isActive)
          : request.body?.published !== undefined
            ? Boolean(request.body.published)
            : !existing.isActive;

      const updated = await db.services.update(id, { isActive: newStatus });

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: newStatus ? 'PUBLISH_SERVICE' : 'UNPUBLISH_SERVICE',
        entityType: 'Service',
        entityId: id,
        details: { title: existing.title, isActive: newStatus },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.send({
        success: true,
        data: updated,
        message: `Service "${existing.title}" is now ${newStatus ? 'Published' : 'Draft'}.`,
      });
    }
  );

  // PUT /api/admin/services/:id
  fastify.put<{
    Params: { id: string };
    Body: Partial<Service> & {
      shortDescription?: string;
      fullDescription?: string;
      image?: string;
      displayOrder?: number;
      published?: boolean;
    };
  }>(
    '/services/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const { id } = request.params;
      const body = request.body;

      const existing = db.services.findById(id);
      if (!existing) {
        return reply.code(404).send({
          success: false,
          message: `Service with id '${id}' not found.`,
        });
      }

      const updates: Partial<Service> = {};

      if (body.title !== undefined) updates.title = (body.title || '').trim();
      if (body.slug !== undefined) updates.slug = body.slug ? body.slug.trim() : null;
      if (body.icon !== undefined) updates.icon = (body.icon || 'Music').trim();
      if (body.category !== undefined) updates.category = body.category;
      if (body.shortDesc !== undefined || body.shortDescription !== undefined) {
        updates.shortDesc = (body.shortDesc || body.shortDescription || '').trim();
      }
      if (body.fullDesc !== undefined || body.fullDescription !== undefined) {
        updates.fullDesc = (body.fullDesc || body.fullDescription || '').trim();
      }
      if (body.imageUrl !== undefined || body.image !== undefined) {
        updates.imageUrl = (body.imageUrl || body.image || '').trim();
      }
      if (body.number !== undefined) updates.number = body.number;
      if (body.ctaText !== undefined) updates.ctaText = body.ctaText;
      if (body.pricingRange !== undefined) updates.pricingRange = body.pricingRange;

      if (body.order !== undefined || body.displayOrder !== undefined) {
        updates.order = Number(body.order !== undefined ? body.order : body.displayOrder);
      }

      if (body.isActive !== undefined || body.published !== undefined) {
        updates.isActive = Boolean(body.isActive !== undefined ? body.isActive : body.published);
      }

      if (body.features !== undefined) {
        updates.features = Array.isArray(body.features)
          ? body.features
          : typeof body.features === 'string'
            ? (body.features as string).split('\n').map((f) => f.trim()).filter(Boolean)
            : [];
      }

      if ((body as any).description !== undefined) {
        (updates as any).description = ((body as any).description || '').trim();
      }

      if ((body as any).plans !== undefined) updates.plans = (body as any).plans;
      if ((body as any).specs !== undefined) updates.specs = (body as any).specs;
      if ((body as any).specifications !== undefined) {
        const specs = Array.isArray((body as any).specifications)
          ? (body as any).specifications
          : typeof (body as any).specifications === 'string'
            ? ((body as any).specifications as string).split('\n').map((f: string) => f.trim()).filter(Boolean)
            : [];
        (updates as any).specifications = specs;
        if (updates.specs === undefined) updates.specs = specs;
      }
      if ((body as any).processSteps !== undefined) updates.processSteps = (body as any).processSteps;
      if ((body as any).deliverables !== undefined) updates.deliverables = (body as any).deliverables;
      if ((body as any).equipmentList !== undefined) {
        const equip = Array.isArray((body as any).equipmentList)
          ? (body as any).equipmentList
          : typeof (body as any).equipmentList === 'string'
            ? ((body as any).equipmentList as string).split('\n').map((f: string) => f.trim()).filter(Boolean)
            : [];
        (updates as any).equipmentList = equip;
        if (updates.deliverables === undefined) updates.deliverables = equip;
      }
      if ((body as any).faqs !== undefined) updates.faqs = (body as any).faqs;

      try {
        const updated = await db.services.update(id, updates);

        db.activityLogs.log({
          adminUserId: user.id,
          adminUserName: user.name,
          action: 'UPDATE_SERVICE',
          entityType: 'Service',
          entityId: id,
          details: { updates },
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'] || '',
        });

        return reply.send({
          success: true,
          data: updated,
          message: `Service "${updated?.title}" updated successfully.`,
        });
      } catch (err: any) {
        fastify.log.error(err);
        return reply.code(500).send({
          success: false,
          message: err.message || `Failed to update service "${id}" in Supabase database.`,
        });
      }
    }
  );

  // DELETE /api/admin/services/:id
  fastify.delete<{
    Params: { id: string };
  }>(
    '/services/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const { id } = request.params;

      const existing = db.services.findById(id);
      if (!existing) {
        return reply.code(404).send({
          success: false,
          message: `Service with id '${id}' not found.`,
        });
      }

      await db.services.delete(id);

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'DELETE_SERVICE',
        entityType: 'Service',
        entityId: id,
        details: { deletedTitle: existing.title },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.send({
        success: true,
        message: `Service "${existing.title}" deleted successfully.`,
      });
    }
  );
};
