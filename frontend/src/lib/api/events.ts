import type { Event } from '../../types';
import type { ApiResponse } from './types';
import { apiFetch, USE_MOCK_DATA } from './client';
import { adminMockStore } from '../../admin/services/adminMockStore';

function mapStoreEventToPublic(e: any): Event {
  return {
    id: e.id,
    title: e.title,
    artist: e.mainArtist || 'VEXO Headliner',
    venue: e.venue || 'Main Stadium Arena',
    location: e.location ? (e.city ? `${e.city}, ${e.location}` : e.location) : (e.city || 'Global City'),
    date: e.date || 'TBA 2026',
    time: e.time || '20:00 EST',
    imageUrl: e.imageUrl || e.posterUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    price: e.price || e.ticketPrice || '$45.00 - $150.00',
    status: (e.status?.toLowerCase() === 'live'
      ? 'live'
      : e.status?.toLowerCase() === 'sold_out' || e.status?.toLowerCase() === 'sold-out'
      ? 'sold-out'
      : 'upcoming') as 'upcoming' | 'sold-out' | 'live',
    description: e.description,
    ticketUrl: e.ticketUrl,
  };
}

export async function getEvents(): Promise<ApiResponse<Event[]>> {
  if (USE_MOCK_DATA) {
    const raw = (adminMockStore.getEvents().data || []).filter((e: any) => e.published !== false);
    return {
      success: true,
      data: raw.map(mapStoreEventToPublic),
      timestamp: new Date().toISOString(),
    };
  }

  try {
    return await apiFetch<Event[]>('/events');
  } catch {
    const raw = (adminMockStore.getEvents().data || []).filter((e: any) => e.published !== false);
    return {
      success: true,
      data: raw.map(mapStoreEventToPublic),
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getUpcomingEvents(): Promise<ApiResponse<Event[]>> {
  if (USE_MOCK_DATA) {
    const raw = (adminMockStore.getEvents().data || []).filter(
      (e: any) => e.status !== 'CANCELLED' && e.status !== 'cancelled' && e.published !== false
    );
    return {
      success: true,
      data: raw.map(mapStoreEventToPublic),
      timestamp: new Date().toISOString(),
    };
  }

  try {
    return await apiFetch<Event[]>('/events/upcoming');
  } catch {
    const raw = (adminMockStore.getEvents().data || []).filter(
      (e: any) => e.status !== 'CANCELLED' && e.status !== 'cancelled'
    );
    return {
      success: true,
      data: raw.map(mapStoreEventToPublic),
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getEventById(id: string): Promise<ApiResponse<Event | null>> {
  if (USE_MOCK_DATA) {
    const raw = adminMockStore.getEvents().data || [];
    const found = raw.find((e: any) => e.id === id || e.slug === id);
    return {
      success: true,
      data: found ? mapStoreEventToPublic(found) : null,
    };
  }

  try {
    return await apiFetch<Event>(`/events/${id}`);
  } catch {
    const raw = adminMockStore.getEvents().data || [];
    const found = raw.find((e: any) => e.id === id || e.slug === id);
    return {
      success: true,
      data: found ? mapStoreEventToPublic(found) : null,
    };
  }
}
