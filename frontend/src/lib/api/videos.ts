import type { Video } from '../../types';
import type { ApiResponse } from './types';
import { apiFetch, USE_MOCK_DATA } from './client';
import { adminMockStore } from '../../admin/services/adminMockStore';

function mapStoreVideoToPublic(v: any): Video {
  return {
    id: v.id,
    title: v.title,
    artist: v.artist,
    thumbnailUrl: v.thumbnailUrl,
    youtubeId: v.youtubeId,
    category: v.category || 'Official Music Videos',
    description: v.description,
    featured: Boolean(v.featured),
    duration: v.duration || '4:14',
    views: v.views || 0,
    likes: v.likes || Math.floor((v.views || 1000) * 0.07),
    publishedAt: v.publishedAt || '2026',
    tags: Array.isArray(v.tags) ? v.tags : [],
  };
}

export async function getVideos(): Promise<ApiResponse<Video[]>> {
  if (USE_MOCK_DATA) {
    const raw = (adminMockStore.getVideos().data || []).filter((v: any) => v.published !== false);
    return {
      success: true,
      data: raw.map(mapStoreVideoToPublic),
      timestamp: new Date().toISOString(),
    };
  }

  try {
    return await apiFetch<Video[]>('/videos');
  } catch {
    const raw = (adminMockStore.getVideos().data || []).filter((v: any) => v.published !== false);
    return {
      success: true,
      data: raw.map(mapStoreVideoToPublic),
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getFeaturedVideo(): Promise<ApiResponse<Video>> {
  if (USE_MOCK_DATA) {
    const raw = (adminMockStore.getVideos().data || []).filter((v: any) => v.published !== false);
    const featured = raw.find((v: any) => v.featured) || raw[0] || {
      id: 'vid-1',
      title: 'Satane Lage Ho (Official Music Video)',
      artist: 'Rashmi Nishad & Sonu Charan Bhatt',
      youtubeId: 'HcEcM5AtEZ8',
      thumbnailUrl: 'https://img.youtube.com/vi/HcEcM5AtEZ8/maxresdefault.jpg',
      duration: '4:14',
      views: 835,
      publishedAt: '4 Aug 2026',
      category: 'Official Music Videos',
      featured: true,
    };
    return {
      success: true,
      data: mapStoreVideoToPublic(featured),
      timestamp: new Date().toISOString(),
    };
  }

  try {
    return await apiFetch<Video>('/videos/featured');
  } catch {
    const raw = (adminMockStore.getVideos().data || []).filter((v: any) => v.published !== false);
    const featured = raw.find((v: any) => v.featured) || raw[0] || {
      id: 'vid-1',
      title: 'Satane Lage Ho (Official Music Video)',
      artist: 'Rashmi Nishad & Sonu Charan Bhatt',
      youtubeId: 'HcEcM5AtEZ8',
      thumbnailUrl: 'https://img.youtube.com/vi/HcEcM5AtEZ8/maxresdefault.jpg',
      duration: '4:14',
      views: 835,
      publishedAt: '4 Aug 2026',
      category: 'Official Music Videos',
      featured: true,
    };
    return {
      success: true,
      data: mapStoreVideoToPublic(featured),
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getLatestVideos(limit = 3): Promise<ApiResponse<Video[]>> {
  if (USE_MOCK_DATA) {
    const raw = (adminMockStore.getVideos().data || []).filter((v: any) => v.published !== false);
    return {
      success: true,
      data: raw.slice(0, limit).map(mapStoreVideoToPublic),
      timestamp: new Date().toISOString(),
    };
  }

  try {
    return await apiFetch<Video[]>(`/videos/latest?limit=${limit}`);
  } catch {
    const raw = (adminMockStore.getVideos().data || []).filter((v: any) => v.published !== false);
    return {
      success: true,
      data: raw.slice(0, limit).map(mapStoreVideoToPublic),
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getVideoById(id: string): Promise<ApiResponse<Video | null>> {
  if (USE_MOCK_DATA) {
    const raw = adminMockStore.getVideos().data || [];
    const found = raw.find((v: any) => v.id === id || v.youtubeId === id);
    return {
      success: true,
      data: found ? mapStoreVideoToPublic(found) : null,
    };
  }

  try {
    return await apiFetch<Video>(`/videos/${id}`);
  } catch {
    const raw = adminMockStore.getVideos().data || [];
    const found = raw.find((v: any) => v.id === id || v.youtubeId === id);
    return {
      success: true,
      data: found ? mapStoreVideoToPublic(found) : null,
    };
  }
}
