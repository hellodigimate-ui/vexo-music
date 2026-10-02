import type { ApiResponse } from './types';
import { apiFetch } from './client';

export interface SearchSuggestionItem {
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
  tracks: SearchSuggestionItem[];
  albums: SearchSuggestionItem[];
  videos: SearchSuggestionItem[];
  items: SearchSuggestionItem[];
}

export async function unifiedSearch(
  query?: string,
  limit?: number,
  signal?: AbortSignal
): Promise<ApiResponse<UnifiedSearchResult>> {
  const params: string[] = [];
  if (query && query.trim()) {
    params.push(`q=${encodeURIComponent(query.trim())}`);
  }
  if (limit) {
    params.push(`limit=${limit}`);
  }
  const qs = params.length > 0 ? `?${params.join('&')}` : '';

  try {
    return await apiFetch<UnifiedSearchResult>(`/search${qs}`, { signal });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw err;
    }
    console.warn('[searchApi] Unified search error:', err.message);
    return {
      success: false,
      data: {
        tracks: [],
        albums: [],
        videos: [],
        items: [],
      },
    };
  }
}
