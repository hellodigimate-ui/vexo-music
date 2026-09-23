import type { ApiResponse } from './types';

/**
 * Base configuration and HTTP client for Fastify REST API endpoints.
 * Production API: https://vexo-music.onrender.com/api
 * Local Development: http://localhost:4000/api
 */

function resolveApiBaseUrl(): string {
  // Use ONE consistent production API source: import.meta.env.VITE_API_URL
  // Fall back to VITE_API_BASE_URL (if provided)
  const envUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim();

  let base = envUrl;

  // In production (Vercel deployment or prod build), NEVER use localhost
  if (import.meta.env.PROD) {
    if (!base || base.includes('localhost') || base.includes('127.0.0.1')) {
      base = 'https://vexo-music.onrender.com/api';
    }
  } else {
    // Local development fallback
    if (!base) {
      base = 'http://localhost:4000/api';
    }
  }

  // Remove any trailing slashes
  base = base.replace(/\/+$/, '');

  // Ensure base ends with /api, avoiding duplicate /api
  if (!base.endsWith('/api')) {
    base = `${base}/api`;
  }

  return base;
}

export const API_BASE_URL = resolveApiBaseUrl();

// Set USE_MOCK_DATA to false by default so requests connect to Fastify backend
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_API === 'true';

export function buildApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Prevent duplicate /api in path
  if (cleanEndpoint.startsWith('/api/')) {
    return `${API_BASE_URL}${cleanEndpoint.slice(4)}`;
  }
  if (cleanEndpoint === '/api') {
    return API_BASE_URL;
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = buildApiUrl(endpoint);

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error: any) {
    console.warn(`[API Client] Fetch failed for ${endpoint}. Falling back to mock handler if available.`, error.message);
    throw error;
  }
}
