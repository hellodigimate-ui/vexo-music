import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import type { ApiResponse, Video } from '../types/index.js';

export const videoRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/videos
  fastify.get<{
    Querystring: { category?: string; search?: string; limit?: string; offset?: string };
  }>('/videos', async (request) => {
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

    const formatted: Video[] = videos.map((v) => ({
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
    }));

    const response: ApiResponse<Video[]> = {
      success: true,
      data: formatted,
      total,
    };
    return response;
  });

  // GET /api/videos/featured
  fastify.get('/videos/featured', async () => {
    const homepage = db.homepage.get();
    const list = db.videos.findMany();
    let featured = null;
    if (homepage && homepage.featuredVideoId) {
      featured = list.find((v) => v.youtubeId === homepage.featuredVideoId || v.id === homepage.featuredVideoId);
    }
    if (!featured) {
      featured = list.find((v) => v.youtubeId === 'PsmXAUKjR5Y') || list.find((v) => v.featured) || list[0];
    }
    const formatted: Video = {
      id: featured.id,
      title: featured.title,
      artist: featured.artist,
      youtubeId: featured.youtubeId,
      thumbnailUrl: featured.thumbnailUrl,
      duration: featured.duration,
      views: featured.views,
      publishedAt: featured.publishedAt,
      category: featured.category,
      featured: true,
      description: featured.description || undefined,
    };

    const response: ApiResponse<Video> = {
      success: true,
      data: formatted,
    };
    return response;
  });

  // GET /api/videos/latest
  fastify.get<{
    Querystring: { limit?: string };
  }>('/videos/latest', async (request) => {
    const limit = request.query.limit ? parseInt(request.query.limit, 10) : 3;
    const latest = db.videos.findMany().slice(0, limit);
    const formatted: Video[] = latest.map((v) => ({
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
    }));

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
    const { id } = request.params;
    const video = db.videos.findById(id);

    if (!video) {
      return reply.code(404).send({
        success: false,
        message: `Video with id '${id}' not found.`,
      });
    }

    const formatted: Video = {
      id: video.id,
      title: video.title,
      artist: video.artist,
      youtubeId: video.youtubeId,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      views: video.views,
      publishedAt: video.publishedAt,
      category: video.category,
      featured: video.featured,
      description: video.description || undefined,
    };

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
