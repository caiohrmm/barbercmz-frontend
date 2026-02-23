import { cache } from 'react';
import type { Barbershop, Service } from '@/types';
import { API_URL } from './constants';

const getBaseUrl = () => API_URL.replace(/\/$/, '');

export interface PublicServicesResponse {
  services: Service[];
  count: number;
}

/**
 * Fetch barbershop by slug (public, no auth).
 * Cached per request when used in server components (e.g. page + generateMetadata).
 */
export const getBarbershopBySlug = cache(async (slug: string): Promise<Barbershop | null> => {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/barbershops/slug/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(res.statusText);
  }
  return res.json();
});

/**
 * Fetch active services for a barbershop (public, no auth).
 * Use from server or client.
 */
export async function getPublicServices(
  barbershopId: string
): Promise<PublicServicesResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/barbershops/${barbershopId}/services`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export interface AvailableSlot {
  time: string;
  barberId: string;
  barberName: string;
}

export interface AvailableSlotsResponse {
  slots: AvailableSlot[];
}

/**
 * Fetch available time slots for a date and service (public).
 * date: YYYY-MM-DD
 */
export async function getAvailableSlots(
  barbershopId: string,
  date: string,
  serviceId: string
): Promise<AvailableSlotsResponse> {
  const baseUrl = getBaseUrl();
  const params = new URLSearchParams({ date, serviceId });
  const res = await fetch(
    `${baseUrl}/barbershops/${barbershopId}/available-slots?${params}`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}
