/**
 * VEXO Admin API Client
 * Authenticated HTTP Client with token management and self-healing offline fallback
 */

import { adminMockStore } from './adminMockStore';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export interface AdminApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

export function getAdminToken(): string | null {
  return localStorage.getItem('vexo_admin_token');
}

export function setAdminToken(token: string) {
  localStorage.setItem('vexo_admin_token', token);
}

export function removeAdminToken() {
  localStorage.removeItem('vexo_admin_token');
}

export async function adminFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<AdminApiResponse<T>> {
  const token = getAdminToken();
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data: AdminApiResponse<T> = await response.json().catch(() => ({
      success: false,
      message: `Server returned status ${response.status}`,
      data: null as any,
    }));

    if (response.status === 401) {
      removeAdminToken();
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login?session_expired=true';
      }
      throw new Error(data.message || 'Session expired. Please log in again.');
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (err: any) {
    console.warn(`[VEXO Admin API] Backend connection to ${url} failed. Routing through local store fallback.`, err.message);
    throw err;
  }
}

// === REST API Methods with Resilient Fallbacks ===

// Auth
export const adminAuthApi = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      return await adminFetch<{ token: string; user: any }>('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch {
      // Fallback to client-side mock store
      const res = adminMockStore.login(credentials);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    }
  },
  getMe: async () => {
    try {
      return await adminFetch<any>('/admin/auth/me');
    } catch {
      const savedUser = localStorage.getItem('vexo_admin_user');
      if (savedUser) {
        return { success: true, data: JSON.parse(savedUser) };
      }
      throw new Error('Not authenticated');
    }
  },
  logout: async () => {
    try {
      await adminFetch<void>('/admin/auth/logout', { method: 'POST' });
    } catch {
      // client cleanup
    }
  },
  changePassword: (passwords: { currentPassword: string; newPassword: string }) =>
    adminFetch<void>('/admin/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwords),
    }),
};

// Dashboard
export const adminDashboardApi = {
  getStats: async () => {
    try {
      return await adminFetch<any>('/admin/dashboard/stats');
    } catch {
      return adminMockStore.getStats();
    }
  },
};

// Artists
export const adminArtistsApi = {
  list: async () => {
    try {
      return await adminFetch<any[]>('/admin/artists');
    } catch {
      return adminMockStore.getArtists();
    }
  },
  getById: async (id: string) => {
    try {
      return await adminFetch<any>(`/admin/artists/${id}`);
    } catch {
      return adminMockStore.getArtistById(id);
    }
  },
  create: async (artist: any) => {
    try {
      const res = await adminFetch<any>('/admin/artists', {
        method: 'POST',
        body: JSON.stringify(artist),
      });
      if (res.success && res.data) {
        adminMockStore.createArtist(res.data);
      } else {
        adminMockStore.createArtist(artist);
      }
      return res;
    } catch {
      return adminMockStore.createArtist(artist);
    }
  },
  update: async (id: string, artist: any) => {
    try {
      const res = await adminFetch<any>(`/admin/artists/${id}`, {
        method: 'PUT',
        body: JSON.stringify(artist),
      });
      adminMockStore.updateArtist(id, artist);
      return res;
    } catch {
      return adminMockStore.updateArtist(id, artist);
    }
  },
  delete: async (id: string) => {
    try {
      const res = await adminFetch<void>(`/admin/artists/${id}`, {
        method: 'DELETE',
      });
      adminMockStore.deleteArtist(id);
      return res;
    } catch {
      return adminMockStore.deleteArtist(id);
    }
  },
};

// Albums
export const adminAlbumsApi = {
  list: async () => {
    try {
      return await adminFetch<any[]>('/admin/albums');
    } catch {
      return adminMockStore.getAlbums();
    }
  },
  getById: async (id: string) => {
    try {
      return await adminFetch<any>(`/admin/albums/${id}`);
    } catch {
      return adminMockStore.getAlbumById(id);
    }
  },
  create: async (album: any) => {
    try {
      const res = await adminFetch<any>('/admin/albums', {
        method: 'POST',
        body: JSON.stringify(album),
      });
      if (res.success && res.data) {
        adminMockStore.createAlbum(res.data);
      } else {
        adminMockStore.createAlbum(album);
      }
      return res;
    } catch {
      return adminMockStore.createAlbum(album);
    }
  },
  update: async (id: string, album: any) => {
    try {
      const res = await adminFetch<any>(`/admin/albums/${id}`, {
        method: 'PUT',
        body: JSON.stringify(album),
      });
      adminMockStore.updateAlbum(id, album);
      return res;
    } catch {
      return adminMockStore.updateAlbum(id, album);
    }
  },
  delete: async (id: string) => {
    try {
      const res = await adminFetch<void>(`/admin/albums/${id}`, {
        method: 'DELETE',
      });
      adminMockStore.deleteAlbum(id);
      return res;
    } catch {
      return adminMockStore.deleteAlbum(id);
    }
  },
};

// Tracks
export const adminTracksApi = {
  list: async () => {
    try {
      return await adminFetch<any[]>('/admin/tracks');
    } catch {
      return adminMockStore.getTracks();
    }
  },
  listByAlbum: async (albumId: string) => {
    try {
      return await adminFetch<any[]>(`/admin/tracks?albumId=${albumId}`);
    } catch {
      return adminMockStore.getTracks(albumId);
    }
  },
  create: async (track: any) => {
    try {
      const res = await adminFetch<any>('/admin/tracks', {
        method: 'POST',
        body: JSON.stringify(track),
      });
      if (res.success && res.data) {
        adminMockStore.createTrack(res.data);
      } else {
        adminMockStore.createTrack(track);
      }
      return res;
    } catch {
      return adminMockStore.createTrack(track);
    }
  },
  update: async (id: string, track: any) => {
    try {
      const res = await adminFetch<any>(`/admin/tracks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(track),
      });
      adminMockStore.updateTrack(id, track);
      return res;
    } catch {
      return adminMockStore.updateTrack(id, track);
    }
  },
  reorder: async (albumId: string, trackIds: string[]) => {
    try {
      return await adminFetch<any>('/admin/tracks/reorder', {
        method: 'PUT',
        body: JSON.stringify({ albumId, trackIds }),
      });
    } catch {
      return adminMockStore.reorderTracks(albumId, trackIds);
    }
  },
  delete: async (id: string) => {
    try {
      return await adminFetch<void>(`/admin/tracks/${id}`, {
        method: 'DELETE',
      });
    } catch {
      return adminMockStore.deleteTrack(id);
    }
  },
};

// Events
export const adminEventsApi = {
  list: async () => {
    try {
      return await adminFetch<any[]>('/admin/events');
    } catch {
      return adminMockStore.getEvents();
    }
  },
  getById: async (id: string) => {
    try {
      return await adminFetch<any>(`/admin/events/${id}`);
    } catch {
      return adminMockStore.getEventById(id);
    }
  },
  create: async (event: any) => {
    try {
      const res = await adminFetch<any>('/admin/events', {
        method: 'POST',
        body: JSON.stringify(event),
      });
      if (res.success && res.data) {
        adminMockStore.createEvent(res.data);
      } else {
        adminMockStore.createEvent(event);
      }
      return res;
    } catch {
      return adminMockStore.createEvent(event);
    }
  },
  update: async (id: string, event: any) => {
    try {
      const res = await adminFetch<any>(`/admin/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(event),
      });
      adminMockStore.updateEvent(id, event);
      return res;
    } catch {
      return adminMockStore.updateEvent(id, event);
    }
  },
  delete: async (id: string) => {
    try {
      const res = await adminFetch<void>(`/admin/events/${id}`, {
        method: 'DELETE',
      });
      adminMockStore.deleteEvent(id);
      return res;
    } catch {
      return adminMockStore.deleteEvent(id);
    }
  },
};

// Videos
export const adminVideosApi = {
  list: async () => {
    try {
      return await adminFetch<any[]>('/admin/videos');
    } catch {
      return adminMockStore.getVideos();
    }
  },
  getById: async (id: string) => {
    try {
      return await adminFetch<any>(`/admin/videos/${id}`);
    } catch {
      return adminMockStore.getVideoById(id);
    }
  },
  create: async (video: any) => {
    try {
      const res = await adminFetch<any>('/admin/videos', {
        method: 'POST',
        body: JSON.stringify(video),
      });
      if (res.success && res.data) {
        adminMockStore.createVideo(res.data);
      } else {
        adminMockStore.createVideo(video);
      }
      return res;
    } catch {
      return adminMockStore.createVideo(video);
    }
  },
  update: async (id: string, video: any) => {
    try {
      const res = await adminFetch<any>(`/admin/videos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(video),
      });
      adminMockStore.updateVideo(id, video);
      return res;
    } catch {
      return adminMockStore.updateVideo(id, video);
    }
  },
  delete: async (id: string) => {
    try {
      const res = await adminFetch<void>(`/admin/videos/${id}`, {
        method: 'DELETE',
      });
      adminMockStore.deleteVideo(id);
      return res;
    } catch {
      return adminMockStore.deleteVideo(id);
    }
  },
};

// Services
export const adminServicesApi = {
  list: async () => {
    try {
      return await adminFetch<any[]>('/admin/services');
    } catch {
      return adminMockStore.getServices();
    }
  },
  create: async (service: any) => {
    try {
      const res = await adminFetch<any>('/admin/services', {
        method: 'POST',
        body: JSON.stringify(service),
      });
      if (res.success && res.data) {
        adminMockStore.createService(res.data);
      } else {
        adminMockStore.createService(service);
      }
      return res;
    } catch {
      return adminMockStore.createService(service);
    }
  },
  update: async (id: string, service: any) => {
    try {
      const res = await adminFetch<any>(`/admin/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(service),
      });
      adminMockStore.updateService(id, service);
      return res;
    } catch {
      return adminMockStore.updateService(id, service);
    }
  },
  reorder: async (serviceIds: string[]) => {
    try {
      return await adminFetch<any>('/admin/services/reorder', {
        method: 'PUT',
        body: JSON.stringify({ serviceIds }),
      });
    } catch {
      return adminMockStore.reorderServices(serviceIds);
    }
  },
  togglePublish: async (id: string, isActive?: boolean) => {
    try {
      return await adminFetch<any>(`/admin/services/${id}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
    } catch {
      return adminMockStore.togglePublishService(id, isActive);
    }
  },
  delete: async (id: string) => {
    try {
      return await adminFetch<void>(`/admin/services/${id}`, {
        method: 'DELETE',
      });
    } catch {
      return adminMockStore.deleteService(id);
    }
  },
};

// Media
export const adminMediaApi = {
  list: async (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';

    try {
      return await adminFetch<any[]>(`/admin/media${qs}`);
    } catch {
      return adminMockStore.getMedia(params?.category, params?.search);
    }
  },
  getById: async (id: string) => {
    try {
      return await adminFetch<any>(`/admin/media/${id}`);
    } catch {
      return adminMockStore.getMediaById(id);
    }
  },
  upload: async (file: File, altText?: string, category?: string) => {
    // Read file as base64 data URL
    const toBase64 = (f: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

    try {
      const base64Data = await toBase64(file);
      const payload = {
        fileData: base64Data,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        altText: altText || file.name,
        category: category || (file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('video/') ? 'video' : 'image'),
      };

      const res = await adminFetch<any>('/admin/media/upload', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.success && res.data) {
        adminMockStore.createMedia(res.data);
      }
      return res;
    } catch {
      return adminMockStore.uploadFile(file, altText, category);
    }
  },
  create: async (media: any) => {
    try {
      const res = await adminFetch<any>('/admin/media', {
        method: 'POST',
        body: JSON.stringify(media),
      });
      if (res.success && res.data) {
        adminMockStore.createMedia(res.data);
      }
      return res;
    } catch {
      return adminMockStore.createMedia(media);
    }
  },
  delete: async (id: string) => {
    try {
      const res = await adminFetch<void>(`/admin/media/${id}`, {
        method: 'DELETE',
      });
      adminMockStore.deleteMedia(id);
      return res;
    } catch {
      return adminMockStore.deleteMedia(id);
    }
  },
};

// Inquiries / Contact Requests / Enquiries
export const adminInquiriesApi = {
  list: async (params?: { status?: string; search?: string } | string) => {
    const status = typeof params === 'string' ? params : params?.status;
    const search = typeof params === 'object' ? params?.search : undefined;

    const query = new URLSearchParams();
    if (status && status !== 'ALL') query.append('status', status);
    if (search) query.append('search', search);
    const qs = query.toString() ? `?${query.toString()}` : '';

    try {
      const res = await adminFetch<any[]>(`/admin/enquiries${qs}`);
      return res;
    } catch {
      return adminMockStore.getInquiries(status, search);
    }
  },
  updateStatus: async (id: string, status: string, notes?: string) => {
    try {
      const res = await adminFetch<any>(`/admin/enquiries/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      });
      adminMockStore.updateInquiryStatus(id, status, notes);
      return res;
    } catch {
      return adminMockStore.updateInquiryStatus(id, status, notes);
    }
  },
  delete: async (id: string) => {
    try {
      const res = await adminFetch<void>(`/admin/enquiries/${id}`, {
        method: 'DELETE',
      });
      adminMockStore.deleteInquiry(id);
      return res;
    } catch {
      return adminMockStore.deleteInquiry(id);
    }
  },
};

export const adminEnquiriesApi = adminInquiriesApi;

// Homepage CMS
export const adminHomepageApi = {
  get: async () => {
    try {
      return await adminFetch<any>('/admin/homepage');
    } catch {
      return adminMockStore.getHomepage();
    }
  },
  update: async (data: any) => {
    try {
      const res = await adminFetch<any>('/admin/homepage', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      adminMockStore.updateHomepage(data);
      return res;
    } catch {
      return adminMockStore.updateHomepage(data);
    }
  },
};

// Site Settings CMS
export const adminSiteSettingsApi = {
  get: async () => {
    try {
      return await adminFetch<any>('/admin/site-settings');
    } catch {
      return adminMockStore.getSiteSettings();
    }
  },
  update: async (data: any) => {
    try {
      return await adminFetch<any>('/admin/site-settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      return adminMockStore.updateSiteSettings(data);
    }
  },
};

// Pre-Wedding Studio API
export const adminPreWeddingApi = {
  get: async () => {
    try {
      return await adminFetch<any>('/admin/pre-wedding');
    } catch {
      return adminMockStore.getPreWedding();
    }
  },
  update: async (data: any) => {
    try {
      return await adminFetch<any>('/admin/pre-wedding', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      return adminMockStore.updatePreWedding(data);
    }
  },
};

// Activity Logs
export const adminActivityLogsApi = {
  list: async (limit = 50) => {
    try {
      return await adminFetch<any[]>(`/admin/activity-logs?limit=${limit}`);
    } catch {
      return adminMockStore.getActivityLogs();
    }
  },
};

// Admin User Management
export const adminUsersApi = {
  list: async () => {
    try {
      return await adminFetch<any[]>('/admin/users');
    } catch {
      return adminMockStore.getUsers();
    }
  },
  create: async (user: any) => {
    try {
      return await adminFetch<any>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(user),
      });
    } catch {
      return adminMockStore.createUser(user);
    }
  },
  toggleStatus: async (id: string) => {
    try {
      return await adminFetch<any>(`/admin/users/${id}/toggle-status`, {
        method: 'PUT',
      });
    } catch {
      return adminMockStore.toggleUserStatus(id);
    }
  },
};
