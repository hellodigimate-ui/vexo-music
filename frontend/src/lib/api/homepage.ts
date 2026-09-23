import type { ApiResponse } from './types';
import type { Homepage } from '../../types';
import { apiFetch, USE_MOCK_DATA } from './client';
import { adminMockStore } from '../../admin/services/adminMockStore';

let inflightHomepagePromise: Promise<ApiResponse<Homepage>> | null = null;

export const getHomepage = async (forceRefresh = false): Promise<ApiResponse<Homepage>> => {
  if (USE_MOCK_DATA) {
    const mockRes = adminMockStore.getHomepage();
    return {
      success: true,
      data: mockRes.data,
    };
  }

  if (!forceRefresh && inflightHomepagePromise) {
    return inflightHomepagePromise;
  }

  inflightHomepagePromise = (async () => {
    try {
      const res = await apiFetch<Homepage>('/homepage');
      if (res && res.success && res.data) {
        return res;
      }
      const mockRes = adminMockStore.getHomepage();
      return {
        success: true,
        data: mockRes.data,
      };
    } catch {
      const mockRes = adminMockStore.getHomepage();
      return {
        success: true,
        data: mockRes.data,
      };
    } finally {
      // Clear inflight promise after resolution so subsequent calls can fetch fresh data
      setTimeout(() => {
        inflightHomepagePromise = null;
      }, 5000);
    }
  })();

  return inflightHomepagePromise;
};
