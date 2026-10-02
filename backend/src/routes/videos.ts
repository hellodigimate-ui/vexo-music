import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import type { ApiResponse, Video } from '../types/index.js';

function formatVideoResponse(v: any): Video {
  return {
    id: v.id,
    title: v.title,
    artist: v.artist,
    youtubeId: v.youtubeId,
    thumbnailUrl: v.thumbnailUrl,
    duration: v.duration,
    views: v.views,
    publishedAt: v.publishedAt,
    category: v.category,
    featured: v.featured,
    description: v.description || undefined,
    youtubeUrl: v.youtubeUrl || (v.youtubeId ? `https://www.youtube.com/watch?v=${v.youtubeId}` : null),
    youtubeTitle: v.youtubeTitle || null,
    youtubeViewCount: v.youtubeViewCount !== undefined && v.youtubeViewCount !== null ? Number(v.youtubeViewCount) : null,
    youtubeLikeCount: v.youtubeLikeCount !== undefined && v.youtubeLikeCount !== null ? Number(v.youtubeLikeCount) : null,
    youtubeCommentCount: v.youtubeCommentCount !== undefined && v.youtubeCommentCount !== null ? Number(v.youtubeCommentCount) : null,
    youtubePublishedAt: v.youtubePublishedAt || null,
    youtubeLastSyncedAt: v.youtubeLastSyncedAt || null,
    youtubeSyncStatus: v.youtubeSyncStatus || 'PENDING',
  };
}

export const videoRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/videos
  fastify.get<{
    Querystring: { category?: string; search?: string; limit?: string; offset?: string };
  }>('/videos', async (request, reply) => {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

    const { category, search, limit, offset } = request.query;
    const cleanSearch = search ? search.trim() : '';
    const cleanCategory = category && category !== 'All' ? category.trim() : undefined;
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const parsedOffset = offset ? parseInt(offset, 10) : undefined;

    const { videos, total } = await db.videos.search({
      search: cleanSearch,
      category: cleanCategory,
      limit: parsedLimit,
      offset: parsedOffset,
    });

    const formatted: Video[] = videos.map(formatVideoResponse);

    const response: ApiResponse<Video[]> = {
      success: true,
      data: formatted,
      total,
    };
    return response;
  });

  // GET /api/videos/featured
  fastify.get('/videos/featured', async (request, reply) => {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

    const homepage = db.homepage.get();
    const list = db.videos.findMany();
    let featured = null;
    if (homepage && homepage.featuredVideoId) {
      featured = list.find((v) => v.youtubeId === homepage.featuredVideoId || v.id === homepage.featuredVideoId);
    }
    if (!featured) {
      featured = list.find((v) => v.youtubeId === 'PsmXAUKjR5Y') || list.find((v) => v.featured) || list[0];
    }
    const formatted: Video = formatVideoResponse(featured);

    const response: ApiResponse<Video> = {
      success: true,
      data: formatted,
    };
    return response;
  });

  // GET /api/videos/latest
  fastify.get<{
    Querystring: { limit?: string };
  }>('/videos/latest', async (request, reply) => {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

    const limit = request.query.limit ? parseInt(request.query.limit, 10) : 3;
    const latest = db.videos.findMany().slice(0, limit);
    const formatted: Video[] = latest.map(formatVideoResponse);

    const response: ApiResponse<Video[]> = {
      success: true,
      data: formatted,
      total: formatted.length,
    };
    return response;
  });

  // GET /api/videos/:id
  fastify.get<{
    Params: { id: string };
  }>('/videos/:id', async (request, reply) => {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

    const { id } = request.params;
    const video = db.videos.findById(id);

    if (!video) {
      return reply.code(404).send({
        success: false,
        message: `Video with id '${id}' not found.`,
      });
    }

    const formatted: Video = formatVideoResponse(video);

    const response: ApiResponse<Video> = {
      success: true,
      data: formatted,
    };
    return response;
  });

  // POST /api/videos/:id/view - Public atomic view increment endpoint
  fastify.post<{
    Params: { id: string };
  }>('/videos/:id/view', async (request, reply) => {
    const { id } = request.params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return reply.code(400).send({
        success: false,
        message: 'A valid Video ID is required.',
      });
    }

    try {
      const updatedViews = await db.videos.incrementViews(id.trim());
      if (updatedViews === null) {
        return reply.code(404).send({
          success: false,
          message: `Video with id '${id}' not found.`,
        });
      }

      return reply.code(200).send({
        success: true,
        data: {
          id: id.trim(),
          views: updatedViews,
          viewCount: updatedViews,
        },
        message: 'View registered successfully.',
      });
    } catch (err: any) {
      request.log.error(err);
      return reply.code(500).send({
        success: false,
        message: 'Failed to record video view.',
      });
    }
  });
};
