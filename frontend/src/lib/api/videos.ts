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
    youtubeUrl: v.youtubeUrl || (v.youtubeId ? `https://www.youtube.com/watch?v=${v.youtubeId}` : null),
    youtubeTitle: v.youtubeTitle || null,
    youtubeViewCount: v.youtubeViewCount !== undefined && v.youtubeViewCount !== null ? Number(v.youtubeViewCount) : null,
    youtubeLikeCount: v.youtubeLikeCount !== undefined && v.youtubeLikeCount !== null ? Number(v.youtubeLikeCount) : null,
    youtubeCommentCount: v.youtubeCommentCount !== undefined && v.youtubeCommentCount !== null ? Number(v.youtubeCommentCount) : null,
    youtubePublishedAt: v.youtubePublishedAt || null,
    youtubeLastSyncedAt: v.youtubeLastSyncedAt || null,
    youtubeSyncStatus: v.youtubeSyncStatus || 'PENDING',
  };
}

export async function getVideos(params?: {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<ApiResponse<Video[]>> {
  const queryParts: string[] = [];
  if (params?.search && params.search.trim()) {
    queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);
  }
  if (params?.category && params.category !== 'All') {
    queryParts.push(`category=${encodeURIComponent(params.category.trim())}`);
  }
  if (typeof params?.limit === 'number') {
    queryParts.push(`limit=${params.limit}`);
  }
  if (typeof params?.offset === 'number') {
    queryParts.push(`offset=${params.offset}`);
  }
  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  if (USE_MOCK_DATA) {
    let raw = (adminMockStore.getVideos().data || []).filter((v: any) => v.published !== false);
    if (params?.category && params.category !== 'All') {
      const cat = params.category.trim().toLowerCase();
      raw = raw.filter((v: any) => v.category?.toLowerCase() === cat);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      raw = raw.filter((v: any) => {
        const matchTitle = v.title?.toLowerCase().includes(q);
        const matchArtist = v.artist?.toLowerCase().includes(q);
        const matchDesc = v.description?.toLowerCase().includes(q);
        const matchCat = v.category?.toLowerCase().includes(q);
        const matchTags = Array.isArray(v.tags)
          ? v.tags.some((t: string) => t.toLowerCase().includes(q))
          : typeof v.tags === 'string' && v.tags.toLowerCase().includes(q);
        return matchTitle || matchArtist || matchDesc || matchCat || matchTags;
      });
    }
    return {
      success: true,
      data: raw.map(mapStoreVideoToPublic),
      total: raw.length,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    return await apiFetch<Video[]>(`/videos${queryString}`);
  } catch {
    let raw = (adminMockStore.getVideos().data || []).filter((v: any) => v.published !== false);
    if (params?.category && params.category !== 'All') {
      const cat = params.category.trim().toLowerCase();
      raw = raw.filter((v: any) => v.category?.toLowerCase() === cat);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      raw = raw.filter((v: any) => {
        const matchTitle = v.title?.toLowerCase().includes(q);
        const matchArtist = v.artist?.toLowerCase().includes(q);
        const matchDesc = v.description?.toLowerCase().includes(q);
        const matchCat = v.category?.toLowerCase().includes(q);
        const matchTags = Array.isArray(v.tags)
          ? v.tags.some((t: string) => t.toLowerCase().includes(q))
          : typeof v.tags === 'string' && v.tags.toLowerCase().includes(q);
        return matchTitle || matchArtist || matchDesc || matchCat || matchTags;
      });
    }
    return {
      success: true,
      data: raw.map(mapStoreVideoToPublic),
      total: raw.length,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getFeaturedVideo(): Promise<ApiResponse<Video>> {
  if (USE_MOCK_DATA) {
    const raw = (adminMockStore.getVideos().data || []).filter((v: any) => v.published !== false);
    const featured = raw.find((v: any) => v.youtubeId === 'PsmXAUKjR5Y') || raw.find((v: any) => v.featured) || raw[0] || {
      id: 'vid-bhartar',
      title: 'BHARTAR | R Beer & Rashmi Nishad | Mohit Arora & Shivya Arora | New Rajasthani Song 2026',
      artist: 'R Beer & Rashmi Nishad',
      youtubeId: 'PsmXAUKjR5Y',
      thumbnailUrl: 'https://img.youtube.com/vi/PsmXAUKjR5Y/maxresdefault.jpg',
      duration: '2:22',
      views: 553,
      publishedAt: '24 Aug 2026',
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
    const featured = raw.find((v: any) => v.youtubeId === 'PsmXAUKjR5Y') || raw.find((v: any) => v.featured) || raw[0] || {
      id: 'vid-bhartar',
      title: 'BHARTAR | R Beer & Rashmi Nishad | Mohit Arora & Shivya Arora | New Rajasthani Song 2026',
      artist: 'R Beer & Rashmi Nishad',
      youtubeId: 'PsmXAUKjR5Y',
      thumbnailUrl: 'https://img.youtube.com/vi/PsmXAUKjR5Y/maxresdefault.jpg',
      duration: '2:22',
      views: 553,
      publishedAt: '24 Aug 2026',
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

export async function incrementVideoView(
  id: string
): Promise<ApiResponse<{ id: string; views: number; viewCount: number }>> {
  if (USE_MOCK_DATA) {
    const raw = adminMockStore.getVideos().data || [];
    const vid = raw.find((v: any) => v.id === id || v.youtubeId === id);
    const newViews = vid ? (Number(vid.views) || 0) + 1 : 1;
    if (vid) vid.views = newViews;
    return {
      success: true,
      data: { id, views: newViews, viewCount: newViews },
      message: 'View registered successfully.',
    };
  }

  try {
    return await apiFetch<{ id: string; views: number; viewCount: number }>(
      `/videos/${encodeURIComponent(id)}/view`,
      {
        method: 'POST',
      }
    );
  } catch {
    const raw = adminMockStore.getVideos().data || [];
    const vid = raw.find((v: any) => v.id === id || v.youtubeId === id);
    const newViews = vid ? (Number(vid.views) || 0) + 1 : 1;
    if (vid) vid.views = newViews;
    return {
      success: true,
      data: { id, views: newViews, viewCount: newViews },
      message: 'View registered successfully.',
    };
  }
}

export async function getYoutubeVideoDetails(
  videoIdOrUrl: string
): Promise<ApiResponse<{
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
}>> {
  return await apiFetch<{
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    publishedAt: string;
    views: number;
    likes: number;
    comments: number;
  }>(`/youtube/video/${encodeURIComponent(videoIdOrUrl)}`);
}
