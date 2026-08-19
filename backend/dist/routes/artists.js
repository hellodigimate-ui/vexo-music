import { db } from '../db/index.js';
export const artistRoutes = async (fastify) => {
    // GET /api/artists
    fastify.get('/artists', async (request) => {
        const { search, genre } = request.query;
        let results = db.artists.findMany();
        if (genre) {
            results = results.filter((artist) => artist.genres.some((g) => g.toLowerCase().includes(genre.toLowerCase())));
        }
        if (search) {
            const q = search.toLowerCase();
            results = results.filter((artist) => artist.name.toLowerCase().includes(q) ||
                artist.role.toLowerCase().includes(q) ||
                artist.genres.some((g) => g.toLowerCase().includes(q)));
        }
        const formatted = results.map((a) => ({
            id: a.id,
            name: a.name,
            role: a.role,
            avatarUrl: a.avatarUrl,
            bio: a.bio || undefined,
            monthlyListeners: a.monthlyListeners,
            genres: a.genres,
            socialLinks: a.socials?.map((s) => ({ platform: s.platform, url: s.url })),
            featured: a.featured,
            isComingSoon: a.isComingSoon,
        }));
        const response = {
            success: true,
            data: formatted,
            total: formatted.length,
        };
        return response;
    });
    // GET /api/artists/featured
    fastify.get('/artists/featured', async () => {
        const featured = db.artists.findMany().filter((a) => a.featured);
        const formatted = featured.map((a) => ({
            id: a.id,
            name: a.name,
            role: a.role,
            avatarUrl: a.avatarUrl,
            bio: a.bio || undefined,
            monthlyListeners: a.monthlyListeners,
            genres: a.genres,
            socialLinks: a.socials?.map((s) => ({ platform: s.platform, url: s.url })),
            featured: a.featured,
            isComingSoon: a.isComingSoon,
        }));
        const response = {
            success: true,
            data: formatted,
            total: formatted.length,
        };
        return response;
    });
    // GET /api/artists/:id
    fastify.get('/artists/:id', async (request, reply) => {
        const { id } = request.params;
        const artist = db.artists.findById(id) || db.artists.findBySlug(id);
        if (!artist) {
            return reply.code(404).send({
                success: false,
                message: `Artist with id or slug '${id}' not found.`,
            });
        }
        const formatted = {
            id: artist.id,
            name: artist.name,
            role: artist.role,
            avatarUrl: artist.avatarUrl,
            bio: artist.bio || undefined,
            monthlyListeners: artist.monthlyListeners,
            genres: artist.genres,
            socialLinks: artist.socials?.map((s) => ({ platform: s.platform, url: s.url })),
            featured: artist.featured,
            isComingSoon: artist.isComingSoon,
        };
        const response = {
            success: true,
            data: formatted,
        };
        return response;
    });
};
