import type { FastifyPluginAsync } from 'fastify';
import {
  parseYouTubeVideoId,
  fetchYouTubeVideoDetails,
  YouTubeApiError,
  syncVideoWithYouTube,
  syncAllVideosWithYouTube,
} from '../services/youtube.js';

export const youtubeRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/youtube/video/:videoId
   *
   * Automatically retrieves and returns public YouTube video information
   * using the YouTube Data API v3.
   *
   * Accepts:
   * - 11-character video ID (e.g. 7GJy_1S0-c0)
   * - Full YouTube watch URL (URL-encoded)
   * - youtu.be short URL
   */
  fastify.get<{
    Params: { videoId: string };
  }>('/youtube/video/:videoId', async (request, reply) => {
    const rawId = request.params.videoId;
    if (!rawId || typeof rawId !== 'string' || !rawId.trim()) {
      return reply.code(400).send({
        success: false,
        message: 'A valid YouTube video ID or URL parameter is required.',
      });
    }

    const decodedId = decodeURIComponent(rawId.trim());
    const videoId = parseYouTubeVideoId(decodedId);

    if (!videoId) {
      return reply.code(400).send({
        success: false,
        message:
          'Invalid YouTube video ID or URL format. Please provide a valid 11-character video ID or YouTube URL.',
      });
    }

    try {
      const videoData = await fetchYouTubeVideoDetails(videoId);

      return reply.code(200).send({
        success: true,
        data: {
          videoId: videoData.videoId,
          title: videoData.title,
          description: videoData.description,
          thumbnail: videoData.thumbnail,
          publishedAt: videoData.publishedAt,
          views: videoData.views,
          likes: videoData.likes,
          comments: videoData.comments,
        },
      });
    } catch (err: any) {
      if (err instanceof YouTubeApiError) {
        return reply.code(err.statusCode).send({
          success: false,
          message: err.message,
        });
      }

      request.log.error(err);
      return reply.code(500).send({
        success: false,
        message: 'An unexpected internal error occurred while processing the YouTube request.',
      });
    }
  });

  /**
   * POST or GET /api/youtube/sync/:id
   * Triggers YouTube synchronization for a specific video ID or YouTube video ID.
   */
  fastify.all<{
    Params: { id: string };
  }>('/youtube/sync/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      const result = await syncVideoWithYouTube(id);
      return reply.code(result.success ? 200 : 400).send({
        success: result.success,
        data: result.video,
        message: result.message,
      });
    } catch (err: any) {
      return reply.code(500).send({
        success: false,
        message: err.message,
      });
    }
  });

  /**
   * POST or GET /api/youtube/sync-all
   * Triggers batch synchronization for all YouTube videos.
   */
  fastify.all('/youtube/sync-all', async (request, reply) => {
    try {
      const result = await syncAllVideosWithYouTube(false);
      return reply.code(200).send({
        success: true,
        data: result,
        message: `Synced ${result.synced} of ${result.total} videos. Failed: ${result.failed}.`,
      });
    } catch (err: any) {
      return reply.code(500).send({
        success: false,
        message: err.message,
      });
    }
  });
};

