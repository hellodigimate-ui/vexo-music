import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index.js';
import type { Track } from '../../db/types.js';

export const adminTrackRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/tracks
  fastify.get<{
    Querystring: { albumId?: string };
  }>(
    '/tracks',
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const { albumId } = request.query;
      let tracks = db.tracks.findMany();

      if (albumId) {
        tracks = tracks.filter((t) => t.albumId === albumId);
      }

      // Sort by order ascending
      tracks.sort((a, b) => (a.order || 0) - (b.order || 0));

      return {
        success: true,
        data: tracks,
        total: tracks.length,
      };
    }
  );

  // GET /api/admin/tracks/:id
  fastify.get<{
    Params: { id: string };
  }>(
    '/tracks/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params;
      const track = db.tracks.findById(id);
      if (!track) {
        return reply.code(404).send({
          success: false,
          message: `Track with id '${id}' not found.`,
        });
      }
      return {
        success: true,
        data: track,
      };
    }
  );

  // PUT /api/admin/tracks/reorder
  fastify.put<{
    Body: {
      albumId?: string;
      trackIds: string[];
    };
  }>(
    '/tracks/reorder',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { trackIds } = request.body;
      if (Array.isArray(trackIds)) {
        await Promise.all(
          trackIds.map((id, index) => db.tracks.update(id, { order: index + 1 }))
        );
      }
      return reply.send({
        success: true,
        message: 'Tracks reordered successfully.',
      });
    }
  );

  // POST /api/admin/tracks
  fastify.post<{
    Body: {
      title: string;
      artistName: string;
      artistId?: string;
      albumId?: string;
      duration?: number;
      coverUrl?: string;
      audioUrl?: string;
      spotifyUrl?: string;
      spotifyTrackId?: string;
      youtubeUrl?: string;
      genre?: string;
      plays?: number;
      isPopular?: boolean;
      published?: boolean;
      order?: number;
    };
  }>(
    '/tracks',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const body = request.body;

      if (!body.title) {
        return reply.code(400).send({
          success: false,
          message: 'Track title is required.',
        });
      }

      // Auto-fallback cover from album if not provided
      let coverUrl = body.coverUrl || '';
      let artistName = body.artistName || 'VEXO Artist';
      let genre = body.genre || 'Electronic';

      if (body.albumId) {
        const album = db.albums.findById(body.albumId);
        if (album) {
          if (!coverUrl) coverUrl = album.coverUrl;
          if (!body.artistName) artistName = album.artistName;
          if (!body.genre) genre = album.genre;
        }
      }

      const created = await db.tracks.create({
        title: body.title,
        artistName,
        artistId: body.artistId || null,
        albumId: body.albumId || null,
        duration: Number(body.duration) || 210,
        coverUrl,
        audioUrl: body.audioUrl || null,
        spotifyUrl: body.spotifyUrl || null,
        youtubeUrl: body.youtubeUrl || null,
        genre,
        plays: Number(body.plays) || 0,
        isPopular: Boolean(body.isPopular),
        order: Number(body.order) || 1,
      });

      // Update parent album track count
      if (body.albumId) {
        const albumTracks = db.tracks.findMany().filter((t) => t.albumId === body.albumId);
        await db.albums.update(body.albumId, { trackCount: albumTracks.length });
      }

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'CREATE_TRACK',
        entityType: 'Track',
        entityId: created.id,
        details: { title: body.title, artistName, albumId: body.albumId },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.code(201).send({
        success: true,
        data: created,
        message: `Track "${body.title}" added successfully.`,
      });
    }
  );

  // PUT /api/admin/tracks/:id
  fastify.put<{
    Params: { id: string };
    Body: Partial<Track> & { published?: boolean; spotifyTrackId?: string };
  }>(
    '/tracks/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const { id } = request.params;
      const updates = request.body;

      const existing = db.tracks.findById(id);
      if (!existing) {
        return reply.code(404).send({
          success: false,
          message: `Track with id '${id}' not found.`,
        });
      }

      const updated = await db.tracks.update(id, updates);

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'UPDATE_TRACK',
        entityType: 'Track',
        entityId: id,
        details: { updates },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.send({
        success: true,
        data: updated,
        message: `Track "${updated?.title}" updated successfully.`,
      });
    }
  );

  // DELETE /api/admin/tracks/:id
  fastify.delete<{
    Params: { id: string };
  }>(
    '/tracks/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const { id } = request.params;

      const existing = db.tracks.findById(id);
      if (!existing) {
        return reply.code(404).send({
          success: false,
          message: `Track with id '${id}' not found.`,
        });
      }

      const albumId = existing.albumId;
      await db.tracks.delete(id);

      // Update parent album track count
      if (albumId) {
        const albumTracks = db.tracks.findMany().filter((t) => t.albumId === albumId);
        await db.albums.update(albumId, { trackCount: albumTracks.length });
      }

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'DELETE_TRACK',
        entityType: 'Track',
        entityId: id,
        details: { deletedTitle: existing.title },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.send({
        success: true,
        message: `Track "${existing.title}" deleted successfully.`,
      });
    }
  );
};
