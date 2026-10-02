import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import type { ApiResponse, Album, Track } from '../types/index.js';

export const albumRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/albums
  fastify.get<{
    Querystring: { genre?: string; search?: string };
  }>('/albums', async (request) => {
    const { genre, search } = request.query;
    let results = db.albums.findMany();

    if (genre && genre !== 'All') {
      results = results.filter((album) =>
        album.genre.toLowerCase().includes(genre.toLowerCase())
      );
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (album) =>
          album.title.toLowerCase().includes(q) ||
          album.artistName.toLowerCase().includes(q)
      );
    }

    results.sort((a: any, b: any) => (a.order ?? 99) - (b.order ?? 99));

    const cleanVal = (v?: string | null) => (v && v !== 'null' && v !== 'undefined' ? v.trim() : undefined);

    const formatted = results.map((a) => {
      const albumTracks = db.tracks.findMany().filter((t) => t.albumId === a.id);
      const firstTrackWithYt = albumTracks.find((t) => t.youtubeUrl && t.youtubeUrl !== 'null');
      const allVideos = db.videos.findMany();
      const aTitle = (a.title || '').trim().toLowerCase();
      const matchingVideo = allVideos.find((v) => {
        const vTitle = (v.title || '').toLowerCase();
        if ((aTitle.includes('साजन') || aTitle.includes('sajan')) && (vTitle.includes('साजन') || vTitle.includes('sajan'))) return true;
        if ((aTitle.includes('moriya') || aTitle.includes('मोरिया')) && (vTitle.includes('moriya') || vTitle.includes('मोरिया'))) return true;
        if ((aTitle.includes('bansa') || aTitle.includes('बांसा')) && (vTitle.includes('bansa') || vTitle.includes('बांसा'))) return true;
        if (aTitle.includes('bhartar') && vTitle.includes('bhartar')) return true;
        if (aTitle.includes('satane') && vTitle.includes('satane')) return true;
        return (aTitle && vTitle.includes(aTitle)) || (vTitle && aTitle.includes(vTitle));
      });

      const resolvedYt =
        cleanVal(a.youtubeUrl) ||
        cleanVal(firstTrackWithYt?.youtubeUrl) ||
        (matchingVideo?.youtubeId ? `https://youtu.be/${matchingVideo.youtubeId}` : undefined);

      return {
        id: a.id,
        title: (a.title || '').trim(),
        artist: (a.artistName || 'VEXO Artist').trim(),
        artistName: (a.artistName || 'VEXO Artist').trim(),
        artistId: cleanVal(a.artistId),
        coverUrl: cleanVal(a.coverUrl) || matchingVideo?.thumbnailUrl || undefined,
        releaseDate: a.releaseDate,
        year: a.year || (a.releaseDate ? new Date(a.releaseDate).getFullYear() : 2026),
        genre: (a.genre || 'Rajasthani Folk').trim(),
        trackCount: albumTracks.length > 0 ? albumTracks.length : (a.trackCount || 1),
        spotifyUrl: cleanVal(a.spotifyUrl),
        youtubeUrl: resolvedYt,
        appleMusicUrl: cleanVal(a.appleMusicUrl),
      };
    });

    const response: ApiResponse<Album[]> = {
      success: true,
      data: formatted as any,
      total: formatted.length,
    };
    return response;
  });

  // GET /api/albums/:id
  fastify.get<{
    Params: { id: string };
  }>('/albums/:id', async (request, reply) => {
    const { id } = request.params;
    let album = db.albums.findById(id);

    if (!album) {
      album = db.albums.findMany().find((a) =>
        a.slug === id ||
        (a.title && a.title.trim().toLowerCase() === id.trim().toLowerCase())
      ) || null;
    }

    if (!album) {
      return reply.code(404).send({
        success: false,
        message: `Album with id '${id}' not found.`,
      });
    }

    const cleanVal = (v?: string | null) => (v && v !== 'null' && v !== 'undefined' ? v.trim() : undefined);
    const albumTracks = db.tracks.findMany().filter((t) => t.albumId === album!.id);
    const allVideos = db.videos.findMany();
    const aTitle = (album.title || '').trim().toLowerCase();
    const matchingVideo = allVideos.find((v) => {
      const vTitle = (v.title || '').toLowerCase();
      return (aTitle && vTitle.includes(aTitle)) || (vTitle && aTitle.includes(vTitle));
    });

    const resolvedYt =
      cleanVal(album.youtubeUrl) ||
      (albumTracks.find((t) => cleanVal(t.youtubeUrl))?.youtubeUrl) ||
      (matchingVideo?.youtubeId ? `https://youtu.be/${matchingVideo.youtubeId}` : undefined);

    const formatted = {
      id: album.id,
      title: (album.title || '').trim(),
      artist: (album.artistName || 'VEXO Artist').trim(),
      artistName: (album.artistName || 'VEXO Artist').trim(),
      artistId: cleanVal(album.artistId),
      coverUrl: cleanVal(album.coverUrl) || matchingVideo?.thumbnailUrl || undefined,
      releaseDate: album.releaseDate,
      year: album.year,
      genre: (album.genre || 'Rajasthani Folk').trim(),
      trackCount: Math.max(album.trackCount || 0, albumTracks.length, 1),
      tracks: albumTracks.map((t) => ({
        id: t.id,
        title: (t.title || '').trim(),
        artist: (t.artistName || album!.artistName || 'VEXO Artist').trim(),
        artistName: (t.artistName || album!.artistName || 'VEXO Artist').trim(),
        albumId: t.albumId || album!.id,
        album: t.albumId || album!.id,
        duration: t.duration || 210,
        coverUrl: cleanVal(t.coverUrl) || cleanVal(album!.coverUrl) || matchingVideo?.thumbnailUrl || undefined,
        audioUrl: cleanVal(t.audioUrl),
        spotifyUrl: cleanVal(t.spotifyUrl) || cleanVal(album!.spotifyUrl),
        youtubeUrl: cleanVal(t.youtubeUrl) || cleanVal(t.audioUrl) || resolvedYt,
        genre: (t.genre || album!.genre || 'Rajasthani Folk').trim(),
      })),
      spotifyUrl: cleanVal(album.spotifyUrl),
      youtubeUrl: resolvedYt,
      appleMusicUrl: cleanVal(album.appleMusicUrl),
    };

    const response: ApiResponse<Album> = {
      success: true,
      data: formatted as any,
    };
    return response;
  });

  // GET /api/tracks
  fastify.get<{
    Querystring: { albumId?: string; search?: string };
  }>('/tracks', async (request) => {
    const { albumId, search } = request.query;
    let results = db.tracks.findMany();

    if (albumId) {
      results = results.filter((t) => t.albumId === albumId);
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artistName.toLowerCase().includes(q)
      );
    }

    results.sort((a: any, b: any) => (a.order ?? 99) - (b.order ?? 99));

    const cleanVal = (v?: string | null) => (v && v !== 'null' && v !== 'undefined' ? v.trim() : undefined);
    const allVideos = db.videos.findMany();

    const formatted = results.map((t) => {
      const album = t.albumId ? db.albums.findById(t.albumId) : null;
      const tTitle = (t.title || '').trim().toLowerCase();
      const matchingVideo = allVideos.find((v) => {
        const vTitle = (v.title || '').toLowerCase();
        if ((tTitle.includes('साजन') || tTitle.includes('sajan')) && (vTitle.includes('साजन') || vTitle.includes('sajan'))) return true;
        if ((tTitle.includes('moriya') || tTitle.includes('मोरिया')) && (vTitle.includes('moriya') || vTitle.includes('मोरिया'))) return true;
        if ((tTitle.includes('bansa') || tTitle.includes('बांसा')) && (vTitle.includes('bansa') || vTitle.includes('बांसा'))) return true;
        if (tTitle.includes('bhartar') && vTitle.includes('bhartar')) return true;
        if (tTitle.includes('satane') && vTitle.includes('satane')) return true;
        return (tTitle && vTitle.includes(tTitle)) || (vTitle && tTitle.includes(vTitle));
      });

      const rawYt = cleanVal(t.youtubeUrl) || cleanVal(t.audioUrl);
      const resolvedYt =
        rawYt ||
        cleanVal(album?.youtubeUrl) ||
        (matchingVideo?.youtubeId ? `https://youtu.be/${matchingVideo.youtubeId}` : undefined);

      const resolvedCover =
        cleanVal(t.coverUrl) ||
        cleanVal(album?.coverUrl) ||
        matchingVideo?.thumbnailUrl ||
        undefined;

      return {
        id: t.id,
        title: (t.title || '').trim(),
        artist: (t.artistName || album?.artistName || 'VEXO Artist').trim(),
        artistName: (t.artistName || album?.artistName || 'VEXO Artist').trim(),
        albumId: t.albumId || undefined,
        album: t.albumId || undefined,
        duration: t.duration || 210,
        coverUrl: resolvedCover,
        audioUrl: cleanVal(t.audioUrl),
        spotifyUrl: cleanVal(t.spotifyUrl) || cleanVal(album?.spotifyUrl),
        youtubeUrl: resolvedYt,
        genre: (t.genre || album?.genre || 'Rajasthani Folk').trim(),
      };
    });

    const response: ApiResponse<Track[]> = {
      success: true,
      data: formatted as any,
      total: formatted.length,
    };
    return response;
  });
};
