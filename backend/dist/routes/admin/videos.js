import { db } from '../../db/index.js';
export const adminVideoRoutes = async (fastify) => {
    // GET /api/admin/videos
    fastify.get('/videos', { preHandler: [fastify.authenticate] }, async () => {
        const videos = db.videos.findMany();
        return {
            success: true,
            data: videos,
            total: videos.length,
        };
    });
    // GET /api/admin/videos/:id
    fastify.get('/videos/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
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
    });
    // POST /api/admin/videos
    fastify.post('/videos', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const user = request.adminUser;
        const body = request.body;
        if (!body.title || !body.artist || !body.youtubeId) {
            return reply.code(400).send({
                success: false,
                message: 'Title, artist, and YouTube Video ID are required.',
            });
        }
        const tags = Array.isArray(body.tags)
            ? body.tags
            : typeof body.tags === 'string'
                ? body.tags.split(',').map((t) => t.trim()).filter(Boolean)
                : [];
        const thumbUrl = body.thumbnailUrl || `https://img.youtube.com/vi/${body.youtubeId}/maxresdefault.jpg`;
        const created = db.videos.create({
            title: body.title,
            artist: body.artist,
            youtubeId: body.youtubeId,
            thumbnailUrl: thumbUrl,
            duration: body.duration || '3:30',
            views: Number(body.views) || 0,
            publishedAt: body.publishedAt ||
                new Date().toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                }),
            category: body.category || 'Official Music Videos',
            featured: Boolean(body.featured),
            description: body.description || null,
            tags,
            order: Number(body.order) || 0,
        });
        db.activityLogs.log({
            adminUserId: user.id,
            adminUserName: user.name,
            action: 'CREATE_VIDEO',
            entityType: 'Video',
            entityId: created.id,
            details: { title: body.title, youtubeId: body.youtubeId },
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'] || '',
        });
        return reply.code(201).send({
            success: true,
            data: created,
            message: `Video "${body.title}" added successfully.`,
        });
    });
    // PUT /api/admin/videos/:id
    fastify.put('/videos/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const user = request.adminUser;
        const { id } = request.params;
        const updates = request.body;
        const existing = db.videos.findById(id);
        if (!existing) {
            return reply.code(404).send({
                success: false,
                message: `Video with id '${id}' not found.`,
            });
        }
        if (updates.tags && typeof updates.tags === 'string') {
            updates.tags = updates.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);
        }
        const updated = db.videos.update(id, updates);
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
            data: updated,
            message: `Video "${updated?.title}" updated successfully.`,
        });
    });
    // DELETE /api/admin/videos/:id
    fastify.delete('/videos/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const user = request.adminUser;
        const { id } = request.params;
        const existing = db.videos.findById(id);
        if (!existing) {
            return reply.code(404).send({
                success: false,
                message: `Video with id '${id}' not found.`,
            });
        }
        db.videos.delete(id);
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
    });
};
