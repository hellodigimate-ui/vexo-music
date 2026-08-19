import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index.js';
import type { Event } from '../../db/types.js';

export const adminEventRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/events
  fastify.get(
    '/events',
    { preHandler: [fastify.authenticate] },
    async () => {
      const events = db.events.findMany();
      return {
        success: true,
        data: events,
        total: events.length,
      };
    }
  );

  // GET /api/admin/events/:id
  fastify.get<{
    Params: { id: string };
  }>(
    '/events/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params;
      const event = db.events.findById(id);
      if (!event) {
        return reply.code(404).send({
          success: false,
          message: `Event with id '${id}' not found.`,
        });
      }
      return {
        success: true,
        data: event,
      };
    }
  );

  // POST /api/admin/events
  fastify.post<{
    Body: {
      title: string;
      slug?: string;
      mainArtist: string;
      date: string;
      time: string;
      venue: string;
      location: string;
      city?: string;
      country?: string;
      ticketUrl?: string;
      price: string;
      status?: 'upcoming' | 'live' | 'sold-out' | 'past';
      imageUrl: string;
      gallery?: string[];
      description?: string;
      featured?: boolean;
      published?: boolean;
      order?: number;
      artistIds?: string[];
    };
  }>(
    '/events',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const body = request.body;

      if (!body.title || !body.mainArtist || !body.date || !body.venue || !body.imageUrl) {
        return reply.code(400).send({
          success: false,
          message: 'Title, main artist, date, venue, and image URL are required.',
        });
      }

      const slug =
        body.slug ||
        body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      const created = db.events.create(
        {
          title: body.title,
          slug,
          mainArtist: body.mainArtist,
          date: body.date,
          time: body.time || '20:00',
          venue: body.venue,
          location: body.location || body.venue,
          city: body.city || null,
          country: body.country || null,
          ticketUrl: body.ticketUrl || null,
          price: body.price || 'Free',
          status: body.status || 'upcoming',
          imageUrl: body.imageUrl,
          description: body.description || null,
          featured: Boolean(body.featured),
          order: Number(body.order) || 0,
        },
        body.artistIds
      );

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'CREATE_EVENT',
        entityType: 'Event',
        entityId: created?.id,
        details: { title: body.title, venue: body.venue },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.code(201).send({
        success: true,
        data: created,
        message: `Event "${body.title}" created successfully.`,
      });
    }
  );

  // PUT /api/admin/events/:id
  fastify.put<{
    Params: { id: string };
    Body: Partial<Event> & { artistIds?: string[]; gallery?: string[]; published?: boolean };
  }>(
    '/events/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const { id } = request.params;
      const { artistIds, ...updates } = request.body;

      const existing = db.events.findById(id);
      if (!existing) {
        return reply.code(404).send({
          success: false,
          message: `Event with id '${id}' not found.`,
        });
      }

      const updated = db.events.update(id, updates, artistIds);

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'UPDATE_EVENT',
        entityType: 'Event',
        entityId: id,
        details: { updates },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.send({
        success: true,
        data: updated,
        message: `Event "${updated?.title}" updated successfully.`,
      });
    }
  );

  // DELETE /api/admin/events/:id
  fastify.delete<{
    Params: { id: string };
  }>(
    '/events/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const { id } = request.params;

      const existing = db.events.findById(id);
      if (!existing) {
        return reply.code(404).send({
          success: false,
          message: `Event with id '${id}' not found.`,
        });
      }

      db.events.delete(id);

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'DELETE_EVENT',
        entityType: 'Event',
        entityId: id,
        details: { deletedTitle: existing.title },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.send({
        success: true,
        message: `Event "${existing.title}" deleted successfully.`,
      });
    }
  );
};
