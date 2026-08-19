import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import type { ApiResponse, Event } from '../types/index.js';

export const eventRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/events
  fastify.get<{
    Querystring: { status?: 'upcoming' | 'sold-out' | 'live' };
  }>('/events', async (request) => {
    const { status } = request.query;
    let results = db.events.findMany();

    if (status) {
      results = results.filter((e) => e.status === status);
    }

    const formatted = results.map((e) => ({
      id: e.id,
      title: e.title,
      artist: e.mainArtist,
      date: e.date,
      time: e.time,
      venue: e.venue,
      location: e.location,
      city: e.city || undefined,
      country: e.country || undefined,
      ticketUrl: e.ticketUrl || undefined,
      price: e.price,
      status: e.status,
      imageUrl: e.imageUrl,
    }));

    const response: ApiResponse<Event[]> = {
      success: true,
      data: formatted,
      total: formatted.length,
    };
    return response;
  });

  // GET /api/events/upcoming
  fastify.get('/events/upcoming', async () => {
    const upcoming = db.events.findMany().filter((e) => e.status !== 'sold-out');
    const formatted = upcoming.map((e) => ({
      id: e.id,
      title: e.title,
      artist: e.mainArtist,
      date: e.date,
      time: e.time,
      venue: e.venue,
      location: e.location,
      city: e.city || undefined,
      country: e.country || undefined,
      ticketUrl: e.ticketUrl || undefined,
      price: e.price,
      status: e.status,
      imageUrl: e.imageUrl,
    }));

    const response: ApiResponse<Event[]> = {
      success: true,
      data: formatted,
      total: formatted.length,
    };
    return response;
  });

  // GET /api/events/:id
  fastify.get<{
    Params: { id: string };
  }>('/events/:id', async (request, reply) => {
    const { id } = request.params;
    const event = db.events.findById(id);

    if (!event) {
      return reply.code(404).send({
        success: false,
        message: `Event with id '${id}' not found.`,
      });
    }

    const formatted: Event = {
      id: event.id,
      title: event.title,
      artist: event.mainArtist,
      date: event.date,
      time: event.time,
      venue: event.venue,
      location: event.location,
      city: event.city || undefined,
      country: event.country || undefined,
      ticketUrl: event.ticketUrl || undefined,
      price: event.price,
      status: event.status,
      imageUrl: event.imageUrl,
    };

    const response: ApiResponse<Event> = {
      success: true,
      data: formatted,
    };
    return response;
  });
};
