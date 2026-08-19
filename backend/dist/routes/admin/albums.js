import { db } from '../../db/index.js';
export const adminAlbumRoutes = async (fastify) => {
    // GET /api/admin/albums
    fastify.get('/albums', { preHandler: [fastify.authenticate] }, async () => {
        const albums = db.albums.findMany();
        return {
            success: true,
            data: albums,
            total: albums.length,
        };
    });
    // POST /api/admin/albums
    fastify.post('/albums', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const user = request.adminUser;
        const body = request.body;
        if (!body.title || !body.artistName || !body.coverUrl || !body.genre) {
            return reply.code(400).send({
                success: false,
                message: 'Title, artist name, cover URL, and genre are required.',
            });
        }
        const slug = body.slug ||
            body.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        const created = db.albums.create({
            title: body.title,
            slug,
            artistName: body.artistName,
            artistId: body.artistId || null,
            coverUrl: body.coverUrl,
            releaseDate: body.releaseDate || new Date().toISOString().split('T')[0],
            year: Number(body.year) || new Date().getFullYear(),
            genre: body.genre,
            trackCount: Number(body.trackCount) || 0,
            spotifyUrl: body.spotifyUrl || null,
            youtubeUrl: body.youtubeUrl || null,
            appleMusicUrl: body.appleMusicUrl || null,
            featured: Boolean(body.featured),
            order: Number(body.order) || 0,
        });
        db.activityLogs.log({
            adminUserId: user.id,
            adminUserName: user.name,
            action: 'CREATE_ALBUM',
            entityType: 'Album',
            entityId: created.id,
            details: { title: body.title, artistName: body.artistName },
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'] || '',
        });
        return reply.code(201).send({
            success: true,
            data: created,
            message: `Album "${body.title}" created successfully.`,
        });
    });
    // PUT /api/admin/albums/:id
    fastify.put('/albums/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const user = request.adminUser;
        const { id } = request.params;
        const updates = request.body;
        const existing = db.albums.findById(id);
        if (!existing) {
            return reply.code(404).send({
                success: false,
                message: `Album with id '${id}' not found.`,
            });
        }
        const updated = db.albums.update(id, updates);
        db.activityLogs.log({
            adminUserId: user.id,
            adminUserName: user.name,
            action: 'UPDATE_ALBUM',
            entityType: 'Album',
            entityId: id,
            details: { updates },
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'] || '',
        });
        return reply.send({
            success: true,
            data: updated,
            message: `Album "${updated?.title}" updated successfully.`,
        });
    });
    // DELETE /api/admin/albums/:id
    fastify.delete('/albums/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const user = request.adminUser;
        const { id } = request.params;
        const existing = db.albums.findById(id);
        if (!existing) {
            return reply.code(404).send({
                success: false,
                message: `Album with id '${id}' not found.`,
            });
        }
        db.albums.delete(id);
        db.activityLogs.log({
            adminUserId: user.id,
            adminUserName: user.name,
            action: 'DELETE_ALBUM',
            entityType: 'Album',
            entityId: id,
            details: { deletedTitle: existing.title },
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'] || '',
        });
        return reply.send({
            success: true,
            message: `Album "${existing.title}" deleted successfully.`,
        });
    });
};
