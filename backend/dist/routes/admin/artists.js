import { db } from '../../db/index.js';
export const adminArtistRoutes = async (fastify) => {
    // GET /api/admin/artists
    fastify.get('/artists', { preHandler: [fastify.authenticate] }, async () => {
        const artists = db.artists.findMany();
        return {
            success: true,
            data: artists,
            total: artists.length,
        };
    });
    // GET /api/admin/artists/:id
    fastify.get('/artists/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params;
        const artist = db.artists.findById(id);
        if (!artist) {
            return reply.code(404).send({
                success: false,
                message: `Artist with id '${id}' not found.`,
            });
        }
        return {
            success: true,
            data: artist,
        };
    });
    // POST /api/admin/artists
    fastify.post('/artists', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const user = request.adminUser;
        const body = request.body;
        if (!body.name || !body.role) {
            return reply.code(400).send({
                success: false,
                message: 'Artist name and role are required.',
            });
        }
        const slug = body.slug ||
            body.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        const genres = Array.isArray(body.genres)
            ? body.genres
            : typeof body.genres === 'string'
                ? body.genres.split(',').map((g) => g.trim()).filter(Boolean)
                : ['Various'];
        const created = db.artists.create({
            name: body.name,
            slug,
            role: body.role,
            avatarUrl: body.avatarUrl || '',
            coverUrl: body.coverUrl || null,
            bio: body.bio || null,
            monthlyListeners: Number(body.monthlyListeners) || 0,
            genres,
            featured: Boolean(body.featured),
            isComingSoon: body.published !== undefined ? !body.published : Boolean(body.isComingSoon),
            order: Number(body.order) || 0,
        }, body.socials);
        db.activityLogs.log({
            adminUserId: user.id,
            adminUserName: user.name,
            action: 'CREATE_ARTIST',
            entityType: 'Artist',
            entityId: created?.id,
            details: { name: body.name, slug },
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'] || '',
        });
        return reply.code(201).send({
            success: true,
            data: created,
            message: `Artist "${body.name}" created successfully.`,
        });
    });
    // PUT /api/admin/artists/:id
    fastify.put('/artists/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const user = request.adminUser;
        const { id } = request.params;
        const { socials, published, ...updates } = request.body;
        const existing = db.artists.findById(id);
        if (!existing) {
            return reply.code(404).send({
                success: false,
                message: `Artist with id '${id}' not found.`,
            });
        }
        if (updates.genres && typeof updates.genres === 'string') {
            updates.genres = updates.genres.split(',').map((g) => g.trim()).filter(Boolean);
        }
        if (published !== undefined) {
            updates.isComingSoon = !published;
        }
        const updated = db.artists.update(id, updates, socials);
        db.activityLogs.log({
            adminUserId: user.id,
            adminUserName: user.name,
            action: 'UPDATE_ARTIST',
            entityType: 'Artist',
            entityId: id,
            details: { updates },
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'] || '',
        });
        return reply.send({
            success: true,
            data: updated,
            message: `Artist "${updated?.name}" updated successfully.`,
        });
    });
    // DELETE /api/admin/artists/:id
    fastify.delete('/artists/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const user = request.adminUser;
        const { id } = request.params;
        const existing = db.artists.findById(id);
        if (!existing) {
            return reply.code(404).send({
                success: false,
                message: `Artist with id '${id}' not found.`,
            });
        }
        db.artists.delete(id);
        db.activityLogs.log({
            adminUserId: user.id,
            adminUserName: user.name,
            action: 'DELETE_ARTIST',
            entityType: 'Artist',
            entityId: id,
            details: { deletedName: existing.name },
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'] || '',
        });
        return reply.send({
            success: true,
            message: `Artist "${existing.name}" deleted successfully.`,
        });
    });
};
