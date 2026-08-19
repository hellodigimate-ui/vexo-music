import { db } from '../db/index.js';
export const albumRoutes = async (fastify) => {
    // GET /api/albums
    fastify.get('/albums', async (request) => {
        const { genre, search } = request.query;
        let results = db.albums.findMany();
        if (genre && genre !== 'All') {
            results = results.filter((album) => album.genre.toLowerCase().includes(genre.toLowerCase()));
        }
        if (search) {
            const q = search.toLowerCase();
            results = results.filter((album) => album.title.toLowerCase().includes(q) ||
                album.artistName.toLowerCase().includes(q));
        }
        const formatted = results.map((a) => ({
            id: a.id,
            title: a.title,
            artist: a.artistName,
            artistId: a.artistId || undefined,
            coverUrl: a.coverUrl,
            releaseDate: a.releaseDate,
            year: a.year,
            genre: a.genre,
            trackCount: a.trackCount,
            spotifyUrl: a.spotifyUrl || undefined,
            youtubeUrl: a.youtubeUrl || undefined,
            appleMusicUrl: a.appleMusicUrl || undefined,
        }));
        const response = {
            success: true,
            data: formatted,
            total: formatted.length,
        };
        return response;
    });
    // GET /api/albums/:id
    fastify.get('/albums/:id', async (request, reply) => {
        const { id } = request.params;
        const album = db.albums.findById(id);
        if (!album) {
            return reply.code(404).send({
                success: false,
                message: `Album with id '${id}' not found.`,
            });
        }
        const formatted = {
            id: album.id,
            title: album.title,
            artist: album.artistName,
            artistId: album.artistId || undefined,
            coverUrl: album.coverUrl,
            releaseDate: album.releaseDate,
            year: album.year,
            genre: album.genre,
            trackCount: album.trackCount,
            tracks: album.tracks?.map((t) => ({
                id: t.id,
                title: t.title,
                artist: t.artistName,
                albumId: t.albumId || undefined,
                duration: t.duration,
                coverUrl: t.coverUrl,
                audioUrl: t.audioUrl || undefined,
                spotifyUrl: t.spotifyUrl || undefined,
                youtubeUrl: t.youtubeUrl || undefined,
                genre: t.genre,
            })),
            spotifyUrl: album.spotifyUrl || undefined,
            youtubeUrl: album.youtubeUrl || undefined,
            appleMusicUrl: album.appleMusicUrl || undefined,
        };
        const response = {
            success: true,
            data: formatted,
        };
        return response;
    });
    // GET /api/tracks
    fastify.get('/tracks', async (request) => {
        const { albumId, search } = request.query;
        let results = db.tracks.findMany();
        if (albumId) {
            results = results.filter((t) => t.albumId === albumId);
        }
        if (search) {
            const q = search.toLowerCase();
            results = results.filter((t) => t.title.toLowerCase().includes(q) ||
                t.artistName.toLowerCase().includes(q));
        }
        const formatted = results.map((t) => ({
            id: t.id,
            title: t.title,
            artist: t.artistName,
            albumId: t.albumId || undefined,
            duration: t.duration,
            coverUrl: t.coverUrl,
            audioUrl: t.audioUrl || undefined,
            spotifyUrl: t.spotifyUrl || undefined,
            youtubeUrl: t.youtubeUrl || undefined,
            genre: t.genre,
        }));
        const response = {
            success: true,
            data: formatted,
            total: formatted.length,
        };
        return response;
    });
};
