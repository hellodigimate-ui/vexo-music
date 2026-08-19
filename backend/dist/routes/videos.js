import { db } from '../db/index.js';
export const videoRoutes = async (fastify) => {
    // GET /api/videos
    fastify.get('/videos', async (request) => {
        const { category, search } = request.query;
        let results = db.videos.findMany();
        if (category && category !== 'All') {
            results = results.filter((v) => v.category.toLowerCase() === category.toLowerCase());
        }
        if (search) {
            const q = search.toLowerCase();
            results = results.filter((v) => v.title.toLowerCase().includes(q) ||
                v.artist.toLowerCase().includes(q) ||
                (v.description && v.description.toLowerCase().includes(q)));
        }
        const formatted = results.map((v) => ({
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
        const response = {
            success: true,
            data: formatted,
            total: formatted.length,
        };
        return response;
    });
    // GET /api/videos/featured
    fastify.get('/videos/featured', async () => {
        const list = db.videos.findMany();
        const featured = list.find((v) => v.featured) || list[0];
        const formatted = {
            id: featured.id,
            title: featured.title,
            artist: featured.artist,
            youtubeId: featured.youtubeId,
            thumbnailUrl: featured.thumbnailUrl,
            duration: featured.duration,
            views: featured.views,
            publishedAt: featured.publishedAt,
            category: featured.category,
            featured: featured.featured,
            description: featured.description || undefined,
        };
        const response = {
            success: true,
            data: formatted,
        };
        return response;
    });
    // GET /api/videos/latest
    fastify.get('/videos/latest', async (request) => {
        const limit = request.query.limit ? parseInt(request.query.limit, 10) : 3;
        const latest = db.videos.findMany().slice(0, limit);
        const formatted = latest.map((v) => ({
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
        const response = {
            success: true,
            data: formatted,
            total: formatted.length,
        };
        return response;
    });
    // GET /api/videos/:id
    fastify.get('/videos/:id', async (request, reply) => {
        const { id } = request.params;
        const video = db.videos.findById(id);
        if (!video) {
            return reply.code(404).send({
                success: false,
                message: `Video with id '${id}' not found.`,
            });
        }
        const formatted = {
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
        const response = {
            success: true,
            data: formatted,
        };
        return response;
    });
};
