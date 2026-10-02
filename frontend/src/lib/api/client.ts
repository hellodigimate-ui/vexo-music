import type { ApiResponse } from './types';

/**
 * Base configuration and HTTP client for Fastify REST API endpoints.
 * Production API: https://vexo-music.onrender.com/api
 * Local Development: Uses Vite proxy (/api -> http://127.0.0.1:4000)
 */

function resolveApiBaseUrl(): string {
  // In local development, always use relative '/api' which leverages the Vite proxy
  if (import.meta.env.DEV) {
    return '/api';
  }

  // If running in browser on localhost or local network, always use relative '/api'
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocal =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === '[::1]' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.startsWith('172.');

    if (isLocal) {
      return '/api';
    }
  }

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
    if (!base) {
      base = '/api';
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

  if (API_BASE_URL === '/api') {
    if (cleanEndpoint.startsWith('/api/')) {
      return cleanEndpoint;
    }
    if (cleanEndpoint === '/api') {
      return '/api';
    }
    return `/api${cleanEndpoint}`;
  }

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
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
  };

  try {
    const response = await fetch(url, {
      cache: 'no-store',
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
    console.warn(`[API Client] Fetch failed for ${endpoint}:`, error.message);
    throw error;
  }
}
