import type { ApiResponse } from './types';

/**
 * Base configuration and HTTP client for Fastify REST API endpoints.
 * Connects to Fastify API server on http://localhost:4000/api.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Set USE_MOCK_DATA to false by default so requests connect to Fastify backend
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_API === 'true';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

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
