import type { Album, Track } from '../../types';
import type { ApiResponse } from './types';
import { apiFetch } from './client';

function mapStoreAlbumToPublic(a: any): Album {
  return {
    id: a.id,
    title: (a.title || '').trim(),
    artist: (a.artistName || a.artist || 'VEXO Artist').trim(),
    year: typeof a.year === 'number' ? a.year : (a.releaseDate ? new Date(a.releaseDate).getFullYear() : 2026),
    coverUrl: a.coverUrl,
    genre: (a.genre || 'Rajasthani Folk').trim(),
    spotifyUrl: a.spotifyUrl || '',
    youtubeUrl: a.youtubeUrl || '',
    trackCount: a.trackCount || a.tracks?.length || 1,
  };
}

function mapStoreTrackToPublic(t: any): Track {
  return {
    id: t.id,
    title: (t.title || '').trim(),
    artist: (t.artistName || t.artist || 'VEXO Artist').trim(),
    album: t.albumId || t.album || '',
    albumId: t.albumId || t.album || '',
    coverUrl: t.coverUrl,
    duration: t.duration || 210,
    audioUrl: t.audioUrl,
    youtubeUrl: t.youtubeUrl || t.audioUrl || '',
    spotifyUrl: t.spotifyUrl || '',
    genre: (t.genre || 'Rajasthani Folk').trim(),
    plays: t.plays || 0,
    likes: t.likes || Math.floor((t.plays || 1000) * 0.08),
    isPopular: Boolean(t.isPopular),
  };
}

export async function getAlbums(): Promise<ApiResponse<Album[]>> {
  const res = await apiFetch<any[]>('/albums');
  if (!res || !res.success) {
    throw new Error(res?.message || 'Failed to fetch albums from backend API');
  }

  const rawList = Array.isArray(res.data) ? res.data : [];
  return {
    ...res,
    data: rawList.map(mapStoreAlbumToPublic),
  };
}

export async function getAlbumById(id: string): Promise<ApiResponse<Album | null>> {
  const res = await apiFetch<any>(`/albums/${id}`);
  if (!res || !res.success) {
    throw new Error(res?.message || `Failed to fetch album "${id}" from backend API`);
  }

  return {
    ...res,
    data: res.data ? mapStoreAlbumToPublic(res.data) : null,
  };
}

export async function getTracks(albumId?: string): Promise<ApiResponse<Track[]>> {
  const endpoint = albumId ? `/tracks?albumId=${encodeURIComponent(albumId)}` : '/tracks';
  const res = await apiFetch<any[]>(endpoint);
  if (!res || !res.success) {
    throw new Error(res?.message || 'Failed to fetch tracks from backend API');
  }

  const rawList = Array.isArray(res.data) ? res.data : [];
  return {
    ...res,
    data: rawList.map(mapStoreTrackToPublic),
  };
}

