import type { Album, Track } from '../../types';
import type { ApiResponse } from './types';
import { apiFetch, USE_MOCK_DATA } from './client';
import { adminMockStore } from '../../admin/services/adminMockStore';

function mapStoreAlbumToPublic(a: any): Album {
  return {
    id: a.id,
    title: a.title,
    artist: a.artistName || a.artist || 'VEXO Artist',
    year: a.year || (a.releaseDate ? new Date(a.releaseDate).getFullYear() : 2026),
    coverUrl: a.coverUrl,
    genre: a.genre || 'Electronic',
    spotifyUrl: a.spotifyUrl || '',
    youtubeUrl: a.youtubeUrl || '',
    trackCount: a.trackCount || a.tracks?.length || 1,
  };
}

function mapStoreTrackToPublic(t: any): Track {
  return {
    id: t.id,
    title: t.title,
    artist: t.artistName || t.artist || 'VEXO Artist',
    album: t.albumId || t.album || '',
    coverUrl: t.coverUrl,
    duration: t.duration || 210,
    audioUrl: t.audioUrl,
    youtubeUrl: t.youtubeUrl || t.audioUrl || '',
    spotifyUrl: t.spotifyUrl || '',
    genre: t.genre || 'Electronic',
    plays: t.plays || 0,
    likes: t.likes || Math.floor((t.plays || 1000) * 0.08),
    isPopular: Boolean(t.isPopular),
  };
}

export async function getAlbums(): Promise<ApiResponse<Album[]>> {
  if (USE_MOCK_DATA) {
    const raw = adminMockStore.getAlbums().data || [];
    return {
      success: true,
      data: raw.map(mapStoreAlbumToPublic),
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const res = await apiFetch<Album[]>('/albums');
    if (res && res.success && Array.isArray(res.data)) {
      return res;
    }
    // If backend returns empty or invalid, fallback to client mock store
    const raw = adminMockStore.getAlbums().data || [];
    return {
      success: true,
      data: raw.map(mapStoreAlbumToPublic),
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    console.warn('[API] Could not fetch albums from backend, using client store:', err.message);
    const raw = adminMockStore.getAlbums().data || [];
    return {
      success: true,
      data: raw.map(mapStoreAlbumToPublic),
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getAlbumById(id: string): Promise<ApiResponse<Album | null>> {
  if (USE_MOCK_DATA) {
    const raw = adminMockStore.getAlbums().data || [];
    const found = raw.find((a: any) => a.id === id || a.slug === id);
    return {
      success: true,
      data: found ? mapStoreAlbumToPublic(found) : null,
    };
  }

  try {
    const res = await apiFetch<Album>(`/albums/${id}`);
    if (res && res.success && res.data) {
      return res;
    }
    const raw = adminMockStore.getAlbums().data || [];
    const found = raw.find((a: any) => a.id === id || a.slug === id);
    return {
      success: true,
      data: found ? mapStoreAlbumToPublic(found) : null,
    };
  } catch (err: any) {
    console.warn(`[API] Could not fetch album "${id}" from backend, using client store:`, err.message);
    const raw = adminMockStore.getAlbums().data || [];
    const found = raw.find((a: any) => a.id === id || a.slug === id);
    return {
      success: true,
      data: found ? mapStoreAlbumToPublic(found) : null,
    };
  }
}

export async function getTracks(): Promise<ApiResponse<Track[]>> {
  if (USE_MOCK_DATA) {
    const raw = adminMockStore.getTracks().data || [];
    return {
      success: true,
      data: raw.map(mapStoreTrackToPublic),
    };
  }

  try {
    const res = await apiFetch<Track[]>('/tracks');
    if (res && res.success && Array.isArray(res.data)) {
      return res;
    }
    const raw = adminMockStore.getTracks().data || [];
    return {
      success: true,
      data: raw.map(mapStoreTrackToPublic),
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    console.warn('[API] Could not fetch tracks from backend, using client store:', err.message);
    const raw = adminMockStore.getTracks().data || [];
    return {
      success: true,
      data: raw.map(mapStoreTrackToPublic),
      timestamp: new Date().toISOString(),
    };
  }
}
