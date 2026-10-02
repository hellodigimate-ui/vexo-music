import type { FastifyPluginAsync } from 'fastify';
import { db } from '../../db/index.js';
import type { Video } from '../../db/types.js';
import {
  parseYouTubeVideoId,
  buildStandardYouTubeUrl,
  syncVideoWithYouTube,
  syncAllVideosWithYouTube,
} from '../../services/youtube.js';

export const adminVideoRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/admin/videos
  fastify.get(
    '/videos',
    { preHandler: [fastify.authenticate] },
    async () => {
      const videos = db.videos.findMany();
      return {
        success: true,
        data: videos,
        total: videos.length,
      };
    }
  );

  // GET /api/admin/videos/:id
  fastify.get<{
    Params: { id: string };
  }>(
    '/videos/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params;
      const video = db.videos.findById(id);
      if (!video) {
        return reply.code(404).send({
          success: false,
          message: `Video with id '${id}' not found.`,
        });
      }
      return {
        success: true,
        data: video,
      };
    }
  );

  // POST /api/admin/videos
  fastify.post<{
    Body: {
      title: string;
      artist: string;
      youtubeId?: string;
      youtubeUrl?: string;
      thumbnailUrl?: string;
      duration?: string;
      category: string;
      featured?: boolean;
      published?: boolean;
      description?: string;
      tags?: string[] | string;
      order?: number;
    };
  }>(
    '/videos',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const body = request.body;

      if (!body.title || !body.artist) {
        return reply.code(400).send({
          success: false,
          message: 'Title and Artist are required.',
        });
      }

      // Robust YouTube URL / ID parsing
      const parsedYoutubeId = parseYouTubeVideoId(body.youtubeUrl || body.youtubeId);
      if (!parsedYoutubeId) {
        return reply.code(400).send({
          success: false,
          message:
            'Invalid YouTube URL or Video ID. Please provide a valid YouTube watch link, youtu.be link, shorts, or 11-character video ID.',
        });
      }

      const tags = Array.isArray(body.tags)
        ? body.tags
        : typeof body.tags === 'string'
        ? (body.tags as string).split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const thumbUrl =
        body.thumbnailUrl || `https://img.youtube.com/vi/${parsedYoutubeId}/maxresdefault.jpg`;

      const created = await db.videos.create({
        title: body.title,
        artist: body.artist,
        youtubeId: parsedYoutubeId,
        youtubeUrl: buildStandardYouTubeUrl(parsedYoutubeId),
        thumbnailUrl: thumbUrl,
        duration: body.duration || '3:30',
        views: 0, // VEXO native plays/views start at 0
        publishedAt: new Date().toISOString().split('T')[0],
        category: body.category || 'Official Music Videos',
        featured: Boolean(body.featured),
        description: body.description || null,
        tags,
        order: Number(body.order) || 0,
        youtubeSyncStatus: 'PENDING',
      });

      // Automatically trigger initial YouTube sync
      let finalVideo = created;
      try {
        const syncRes = await syncVideoWithYouTube(created.id);
        if (syncRes.success && syncRes.video) {
          finalVideo = syncRes.video;
        }
      } catch (err: any) {
        request.log.warn(`Initial YouTube sync for video ${created.id} was deferred: ${err.message}`);
      }

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'CREATE_VIDEO',
        entityType: 'Video',
        entityId: finalVideo.id,
        details: { title: body.title, youtubeId: parsedYoutubeId },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.code(201).send({
        success: true,
        data: finalVideo,
        message: `Video "${body.title}" added successfully with YouTube link.`,
      });
    }
  );

  // PUT /api/admin/videos/:id
  fastify.put<{
    Params: { id: string };
    Body: Partial<Video> & { youtubeUrl?: string; published?: boolean };
  }>(
    '/videos/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const { id } = request.params;
      const updates = { ...request.body };

      const existing = db.videos.findById(id);
      if (!existing) {
        return reply.code(404).send({
          success: false,
          message: `Video with id '${id}' not found.`,
        });
      }

      // If YouTube URL or ID changed, validate and extract normalized ID
      let youtubeIdChanged = false;
      let newYoutubeId = existing.youtubeId;

      if (updates.youtubeUrl || updates.youtubeId) {
        const parsed = parseYouTubeVideoId(updates.youtubeUrl || updates.youtubeId);
        if (!parsed) {
          return reply.code(400).send({
            success: false,
            message:
              'Invalid YouTube URL or Video ID. Please provide a valid YouTube watch link, youtu.be link, shorts, or 11-character video ID.',
          });
        }
        if (parsed !== existing.youtubeId) {
          youtubeIdChanged = true;
          newYoutubeId = parsed;
        }
        updates.youtubeId = parsed;
        updates.youtubeUrl = buildStandardYouTubeUrl(parsed);
      }

      // Disallow manual override of YouTube-derived statistics
      delete (updates as any).youtubeViewCount;
      delete (updates as any).youtubeLikeCount;
      delete (updates as any).youtubeCommentCount;
      delete (updates as any).youtubePublishedAt;
      delete (updates as any).youtubeLastSyncedAt;
      delete (updates as any).youtubeSyncStatus;

      if (updates.tags && typeof updates.tags === 'string') {
        updates.tags = (updates.tags as string)
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      }

      const updated = await db.videos.update(id, updates);
      let finalVideo = updated || existing;

      // If YouTube ID changed, immediately sync from new YouTube video
      if (youtubeIdChanged) {
        try {
          const syncRes = await syncVideoWithYouTube(id);
          if (syncRes.success && syncRes.video) {
            finalVideo = syncRes.video;
          }
        } catch (err: any) {
          request.log.warn(`YouTube sync on video update failed: ${err.message}`);
        }
      }

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'UPDATE_VIDEO',
        entityType: 'Video',
        entityId: id,
        details: { updates },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.send({
        success: true,
        data: finalVideo,
        message: `Video "${finalVideo.title}" updated successfully.`,
      });
    }
  );

  // POST /api/admin/videos/:id/youtube-sync - Force Sync Now
  fastify.post<{
    Params: { id: string };
  }>(
    '/videos/:id/youtube-sync',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const { id } = request.params;

      const existing = db.videos.findById(id);
      if (!existing) {
        return reply.code(404).send({
          success: false,
          message: `Video with id '${id}' not found.`,
        });
      }

      const syncResult = await syncVideoWithYouTube(id);

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'SYNC_YOUTUBE_VIDEO',
        entityType: 'Video',
        entityId: id,
        details: {
          success: syncResult.success,
          title: existing.title,
          youtubeId: existing.youtubeId,
          message: syncResult.message,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      if (!syncResult.success) {
        return reply.code(400).send({
          success: false,
          data: syncResult.video,
          message: syncResult.message,
        });
      }

      return reply.send({
        success: true,
        data: syncResult.video,
        message: syncResult.message,
      });
    }
  );

  // POST /api/admin/videos/youtube-sync-all - Batch synchronize all YouTube videos
  fastify.post(
    '/videos/youtube-sync-all',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const result = await syncAllVideosWithYouTube();

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'SYNC_ALL_YOUTUBE_VIDEOS',
        entityType: 'Video',
        entityId: 'all',
        details: result,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.send({
        success: result.failed === 0 || result.synced > 0,
        data: result,
        message: `Synced ${result.synced} of ${result.total} videos. Failed: ${result.failed}.`,
      });
    }
  );

  // DELETE /api/admin/videos/:id
  fastify.delete<{
    Params: { id: string };
  }>(
    '/videos/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.adminUser!;
      const { id } = request.params;

      const existing = db.videos.findById(id);
      if (!existing) {
        return reply.code(404).send({
          success: false,
          message: `Video with id '${id}' not found.`,
        });
      }

      await db.videos.delete(id);

      db.activityLogs.log({
        adminUserId: user.id,
        adminUserName: user.name,
        action: 'DELETE_VIDEO',
        entityType: 'Video',
        entityId: id,
        details: { deletedTitle: existing.title },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.send({
        success: true,
        message: `Video "${existing.title}" deleted successfully.`,
      });
    }
  );
};
