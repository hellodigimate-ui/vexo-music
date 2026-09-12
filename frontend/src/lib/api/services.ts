import type { Service } from '../../types';
import type { ServiceItem } from '../../types/service';
import type { ApiResponse } from './types';
import { apiFetch, USE_MOCK_DATA } from './client';
import { adminMockStore } from '../../admin/services/adminMockStore';
import { mockServicesList } from '../../data/services';
import { getMediaUrl } from '../utils';

function mapStoreServiceToItem(s: any): ServiceItem {
  const fallback = mockServicesList.find(
    (m) => m.id === s.id || m.slug === s.slug || m.title?.toLowerCase() === s.title?.toLowerCase()
  );

  return {
    id: s.id,
    number: s.number || fallback?.number || (s.order ? (s.order < 10 ? `0${s.order}` : `${s.order}`) : '01'),
    title: s.title,
    slug: s.slug || fallback?.slug || s.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    shortDesc: s.shortDesc || fallback?.shortDesc || '',
    fullDesc: s.fullDesc || s.shortDesc || fallback?.fullDesc || '',
    imageUrl: getMediaUrl(s.imageUrl) || fallback?.imageUrl || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    icon: s.icon || fallback?.icon || 'Music',
    features: Array.isArray(s.features) && s.features.length > 0
      ? s.features
      : typeof s.features === 'string'
      ? s.features.split('\n').map((f: string) => f.trim()).filter(Boolean)
      : (fallback?.features || []),
    category: s.category || fallback?.category || 'Production',
    ctaText: s.ctaText || fallback?.ctaText || 'INITIATE PROJECT',
    pricingRange: s.pricingRange || fallback?.pricingRange || undefined,
    order: s.order,
    isActive: s.isActive !== undefined ? Boolean(s.isActive) : true,
    plans: (s.plans && s.plans.length > 0) ? s.plans : fallback?.plans,
    specs: (s.specs && s.specs.length > 0) ? s.specs : (s.specifications || fallback?.specs),
    specifications: (s.specifications && s.specifications.length > 0) ? s.specifications : fallback?.specs,
    processSteps: (s.processSteps && s.processSteps.length > 0) ? s.processSteps : fallback?.processSteps,
    deliverables: (s.deliverables && s.deliverables.length > 0) ? s.deliverables : fallback?.deliverables,
    faqs: (s.faqs && s.faqs.length > 0) ? s.faqs : fallback?.faqs,
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
    imageUrl: getMediaUrl(s.imageUrl),
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
    if (res && res.data && Array.isArray(res.data)) {
      return {
        ...res,
        data: res.data.map(mapStoreServiceToItem),
      };
    }
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
