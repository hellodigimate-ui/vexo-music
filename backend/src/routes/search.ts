import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import type { ApiResponse } from '../types/index.js';

export interface UnifiedSearchItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'track' | 'album' | 'video';
  category: string;
  imageUrl: string;
  duration?: string;
  views?: number;
  url: string;
}

export interface UnifiedSearchResult {
  tracks: UnifiedSearchItem[];
  albums: UnifiedSearchItem[];
  videos: UnifiedSearchItem[];
  items: UnifiedSearchItem[];
}

function formatDurationSeconds(sec?: number): string {
  if (!sec || isNaN(sec)) return '';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const searchRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/search?q=...&limit=...
  fastify.get<{
    Querystring: { q?: string; query?: string; search?: string; limit?: number };
  }>('/search', async (request) => {
    const rawQuery = request.query.q || request.query.query || request.query.search || '';
    const q = rawQuery.trim().toLowerCase();
    const limit = Number(request.query.limit) || 6;

    // 1. Search Videos
    let matchedVideos: any[] = [];
    if (q) {
      const searchRes = await db.videos.search({ search: q, limit });
      matchedVideos = searchRes.videos || [];
    } else {
      matchedVideos = (db.videos.findMany() || []).slice(0, 3);
    }

    const videoItems: UnifiedSearchItem[] = matchedVideos.map((v) => ({
      id: v.id,
      title: v.title,
      subtitle: v.artist || 'VEXO Music',
      type: 'video',
      category: v.category || 'Music Video',
      imageUrl: v.thumbnailUrl || '',
      duration: v.duration,
      views: v.views || 0,
      url: `/videos?search=${encodeURIComponent(v.title)}`,
    }));

    // 2. Search Tracks (Music)
    const allTracks = db.tracks.findMany() || [];
    let matchedTracks = allTracks;
    if (q) {
      matchedTracks = allTracks.filter((t) => {
        const titleMatch = (t.title || '').toLowerCase().includes(q);
        const artistMatch = (t.artistName || (t as any).artist || '').toLowerCase().includes(q);
        const genreMatch = (t.genre || '').toLowerCase().includes(q);
        return titleMatch || artistMatch || genreMatch;
      });
    } else {
      matchedTracks = allTracks.slice(0, 3);
    }

    const trackItems: UnifiedSearchItem[] = matchedTracks.slice(0, limit).map((t) => ({
      id: t.id,
      title: t.title,
      subtitle: t.artistName || (t as any).artist || 'VEXO Artist',
      type: 'track',
      category: t.genre ? `${t.genre.trim()} Track` : 'Music Track',
      imageUrl: t.coverUrl || '',
      duration: formatDurationSeconds(t.duration),
      url: `/music?search=${encodeURIComponent(t.title)}`,
    }));

    // 3. Search Albums (Music Releases)
    const allAlbums = db.albums.findMany() || [];
    let matchedAlbums = allAlbums;
    if (q) {
      matchedAlbums = allAlbums.filter((a) => {
        const titleMatch = (a.title || '').toLowerCase().includes(q);
        const artistMatch = (a.artistName || (a as any).artist || '').toLowerCase().includes(q);
        const genreMatch = (a.genre || '').toLowerCase().includes(q);
        return titleMatch || artistMatch || genreMatch;
      });
    } else {
      matchedAlbums = allAlbums.slice(0, 2);
    }

    const albumItems: UnifiedSearchItem[] = matchedAlbums.slice(0, limit).map((a) => ({
      id: a.id,
      title: a.title,
      subtitle: a.artistName || (a as any).artist || 'VEXO Release',
      type: 'album',
      category: 'Album Release',
      imageUrl: a.coverUrl || '',
      url: `/music?search=${encodeURIComponent(a.title)}`,
    }));

    // Combine and prioritize results
    // If the query was entered, interleave tracks, albums, and videos
    const allItems: UnifiedSearchItem[] = [];
    const maxLen = Math.max(trackItems.length, albumItems.length, videoItems.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < trackItems.length) allItems.push(trackItems[i]);
      if (i < videoItems.length) allItems.push(videoItems[i]);
      if (i < albumItems.length) allItems.push(albumItems[i]);
    }

    // Deduplicate any duplicate titles if a track and album share the identical title and cover
    const seenTitles = new Set<string>();
    const deduplicatedItems: UnifiedSearchItem[] = [];
    for (const item of allItems) {
      const key = `${item.title.trim().toLowerCase()}_${item.type}`;
      if (!seenTitles.has(key)) {
        seenTitles.add(key);
        deduplicatedItems.push(item);
      }
    }

    const response: ApiResponse<UnifiedSearchResult> = {
      success: true,
      data: {
        tracks: trackItems,
        albums: albumItems,
        videos: videoItems,
        items: deduplicatedItems.slice(0, limit * 2),
      },
      total: trackItems.length + albumItems.length + videoItems.length,
    };

    return response;
  });
};
