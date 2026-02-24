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

export interface PublicBarber {
  id: string;
  name: string;
}

export interface PublicBarbersResponse {
  barbers: PublicBarber[];
  count: number;
}

/**
 * Fetch barbers for public booking (id + name). Used when barbershop has multiple barbers.
 */
export async function getPublicBarbers(
  barbershopId: string
): Promise<PublicBarbersResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/barbershops/${barbershopId}/barbers`, {
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
 * date: YYYY-MM-DD. If barberId is provided, only that barber's slots are returned.
 */
export async function getAvailableSlots(
  barbershopId: string,
  date: string,
  serviceId: string,
  barberId?: string
): Promise<AvailableSlotsResponse> {
  const baseUrl = getBaseUrl();
  const params = new URLSearchParams({ date, serviceId });
  if (barberId) params.set('barberId', barberId);
  const res = await fetch(
    `${baseUrl}/barbershops/${barbershopId}/available-slots?${params}`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export interface CreateAppointmentPayload {
  barbershopId: string;
  barberId: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  startTime: string; // ISO 8601
}

/** Payload para criar agendamento (exige captcha no backend). */
export interface CreateAppointmentWithCaptchaPayload extends CreateAppointmentPayload {
  captchaToken: string;
}

export interface CreateAppointmentResponse {
  appointment: {
    id: string;
    barbershopId: string;
    barberId: string;
    serviceId: string;
    customerId: string;
    startTime: string;
    endTime: string;
    status: string;
  };
}

export interface RequestVerificationResponse {
  verificationId: string;
  message: string;
}

/**
 * Request SMS verification (sends code to phone). Returns verificationId for the next step.
 */
export async function requestAppointmentVerification(
  payload: CreateAppointmentPayload
): Promise<RequestVerificationResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/appointments/request-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data?.error || res.statusText) as Error & { statusCode?: number };
    err.statusCode = res.status;
    throw err;
  }
  return res.json();
}

/**
 * Verify SMS code and create appointment. Call after requestAppointmentVerification.
 */
export async function verifyAppointment(
  verificationId: string,
  code: string
): Promise<CreateAppointmentResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/appointments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verificationId, code }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data?.error || res.statusText) as Error & { statusCode?: number };
    err.statusCode = res.status;
    throw err;
  }
  return res.json();
}

/**
 * Create appointment (public, no auth). Requires captcha token. Rate limited on backend.
 * SMS flow (requestAppointmentVerification + verifyAppointment) is kept for future use.
 */
export async function createAppointment(
  payload: CreateAppointmentWithCaptchaPayload
): Promise<CreateAppointmentResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data?.error || res.statusText) as Error & { statusCode?: number };
    err.statusCode = res.status;
    throw err;
  }
  return res.json();
}
