import type { ApiResponse } from './types';
import type { Homepage } from '../../types';
import { apiFetch, USE_MOCK_DATA } from './client';
import { adminMockStore } from '../../admin/services/adminMockStore';

export const getHomepage = async (): Promise<ApiResponse<Homepage>> => {
  if (USE_MOCK_DATA) {
    const mockRes = adminMockStore.getHomepage();
    return {
      success: true,
      data: mockRes.data,
    };
  }

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
  } catch (err: any) {
    const mockRes = adminMockStore.getHomepage();
    return {
      success: true,
      data: mockRes.data,
    };
  }
};
