import type { Artist } from '../../types';
import type { ApiResponse } from './types';
import { apiFetch, USE_MOCK_DATA } from './client';
import { adminMockStore } from '../../admin/services/adminMockStore';

function mapStoreArtistToPublic(a: any): Artist {
  return {
    id: a.id,
    name: a.name,
    role: a.role,
    avatarUrl: a.avatarUrl,
    coverUrl: a.coverUrl,
    bio: a.bio,
    monthlyListeners: a.monthlyListeners,
    followers: a.monthlyListeners,
    genres: Array.isArray(a.genres) ? a.genres : [],
    socialLinks: (a.socials || []).map((s: any) => ({
      platform: s.platform,
      url: s.url,
    })),
    isComingSoon: Boolean(a.isComingSoon),
  };
}

export async function getArtists(): Promise<ApiResponse<Artist[]>> {
  if (USE_MOCK_DATA) {
    const raw = adminMockStore.getArtists().data || [];
    return {
      success: true,
      data: raw.map(mapStoreArtistToPublic),
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const res = await apiFetch<Artist[]>('/artists');
    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res;
    }
    const raw = adminMockStore.getArtists().data || [];
    return {
      success: true,
      data: raw.map(mapStoreArtistToPublic),
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    console.warn('[API] Could not fetch artists from backend, using client store:', err.message);
    const raw = adminMockStore.getArtists().data || [];
    return {
      success: true,
      data: raw.map(mapStoreArtistToPublic),
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getFeaturedArtists(): Promise<ApiResponse<Artist[]>> {
  if (USE_MOCK_DATA) {
    const all = adminMockStore.getArtists().data || [];
    const featured = all.filter((a: any) => a.featured);
    const result = featured.length > 0 ? featured : all;
    return {
      success: true,
      data: result.map(mapStoreArtistToPublic),
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const res = await apiFetch<Artist[]>('/artists/featured');
    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res;
    }
    const all = adminMockStore.getArtists().data || [];
    const featured = all.filter((a: any) => a.featured);
    const result = featured.length > 0 ? featured : all;
    return {
      success: true,
      data: result.map(mapStoreArtistToPublic),
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    console.warn('[API] Could not fetch featured artists from backend, using client store:', err.message);
    const all = adminMockStore.getArtists().data || [];
    const featured = all.filter((a: any) => a.featured);
    const result = featured.length > 0 ? featured : all;
    return {
      success: true,
      data: result.map(mapStoreArtistToPublic),
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getArtistById(id: string): Promise<ApiResponse<Artist | null>> {
  if (USE_MOCK_DATA) {
    const all = adminMockStore.getArtists().data || [];
    const found = all.find((a: any) => a.id === id || a.slug === id);
    return {
      success: true,
      data: found ? mapStoreArtistToPublic(found) : null,
    };
  }

  try {
    const res = await apiFetch<Artist>(`/artists/${id}`);
    if (res && res.success && res.data) {
      return res;
    }
    const all = adminMockStore.getArtists().data || [];
    const found = all.find((a: any) => a.id === id || a.slug === id);
    return {
      success: true,
      data: found ? mapStoreArtistToPublic(found) : null,
    };
  } catch (err: any) {
    console.warn(`[API] Could not fetch artist "${id}" from backend, using client store:`, err.message);
    const all = adminMockStore.getArtists().data || [];
    const found = all.find((a: any) => a.id === id || a.slug === id);
    return {
      success: true,
      data: found ? mapStoreArtistToPublic(found) : null,
    };
  }
}
