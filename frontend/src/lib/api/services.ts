import type { Service } from '../../types';
import type { ServiceItem } from '../../types/service';
import type { ApiResponse } from './types';
import { apiFetch, USE_MOCK_DATA } from './client';
import { adminMockStore } from '../../admin/services/adminMockStore';
import { mockServicesList } from '../../data/services';

function mapStoreServiceToItem(s: any): ServiceItem {
  return {
    id: s.id,
    number: s.number || (s.order ? (s.order < 10 ? `0${s.order}` : `${s.order}`) : '01'),
    title: s.title,
    slug: s.slug || s.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    shortDesc: s.shortDesc || '',
    fullDesc: s.fullDesc || s.shortDesc || '',
    imageUrl: s.imageUrl || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    icon: s.icon || 'Music',
    features: Array.isArray(s.features)
      ? s.features
      : typeof s.features === 'string'
      ? s.features.split('\n').map((f: string) => f.trim()).filter(Boolean)
      : [],
    category: s.category || 'Production',
    ctaText: s.ctaText || 'INITIATE PROJECT',
    pricingRange: s.pricingRange || undefined,
    order: s.order,
    isActive: s.isActive !== undefined ? Boolean(s.isActive) : true,
  };
}

function mapStoreServiceToService(s: any): Service {
  return {
    id: s.id,
    number: s.number,
    title: s.title,
    slug: s.slug,
    description: s.shortDesc || s.fullDesc || '',
    shortDesc: s.shortDesc,
    fullDesc: s.fullDesc,
    imageUrl: s.imageUrl,
    icon: s.icon || 'Music',
    iconName: s.icon || 'Music',
    features: Array.isArray(s.features)
      ? s.features
      : typeof s.features === 'string'
      ? s.features.split('\n').map((f: string) => f.trim()).filter(Boolean)
      : [],
    category: s.category || 'production',
    ctaText: s.ctaText,
    pricingRange: s.pricingRange,
    order: s.order,
    isActive: s.isActive,
  };
}

export async function getServices(): Promise<ApiResponse<Service[]>> {
  if (USE_MOCK_DATA) {
    const raw = (adminMockStore.getServices().data || []).filter((s: any) => s.isActive !== false);
    return {
      success: true,
      data: raw.map(mapStoreServiceToService),
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const res = await apiFetch<Service[]>('/services');
    return res;
  } catch {
    const raw = (adminMockStore.getServices().data || []).filter((s: any) => s.isActive !== false);
    return {
      success: true,
      data: raw.map(mapStoreServiceToService),
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getServicesList(): Promise<ApiResponse<ServiceItem[]>> {
  if (USE_MOCK_DATA) {
    const raw = (adminMockStore.getServices().data || []).filter((s: any) => s.isActive !== false);
    const list = raw.length > 0 ? raw.map(mapStoreServiceToItem) : mockServicesList;
    return {
      success: true,
      data: list,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const res = await apiFetch<ServiceItem[]>('/services/detailed');
    return res;
  } catch {
    const raw = (adminMockStore.getServices().data || []).filter((s: any) => s.isActive !== false);
    const list = raw.length > 0 ? raw.map(mapStoreServiceToItem) : mockServicesList;
    return {
      success: true,
      data: list,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getServiceById(id: string): Promise<ApiResponse<ServiceItem | null>> {
  if (USE_MOCK_DATA) {
    const raw = adminMockStore.getServices().data || [];
    const found = raw.find((s: any) => s.id === id || s.slug === id || s.number === id);
    return {
      success: true,
      data: found ? mapStoreServiceToItem(found) : null,
    };
  }

  try {
    return await apiFetch<ServiceItem>(`/services/${id}`);
  } catch {
    const raw = adminMockStore.getServices().data || [];
    const found = raw.find((s: any) => s.id === id || s.slug === id || s.number === id);
    return {
      success: true,
      data: found ? mapStoreServiceToItem(found) : null,
    };
  }
}
