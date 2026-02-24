import api from './api';
import { API_URL } from './constants';
import type { Barbershop } from '@/types';

export interface CreateBarbershopPayload {
  name: string;
  slug?: string;
  planId?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}

export interface CreateBarbershopResponse {
  message: string;
  barbershop: Barbershop;
}

/**
 * Create barbershop + owner (public). Creates subscription trial when planId is provided.
 */
export async function createBarbershop(
  payload: CreateBarbershopPayload
): Promise<CreateBarbershopResponse> {
  const baseUrl = API_URL.replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/barbershops`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error((data?.error as string) || res.statusText) as Error & { statusCode?: number };
    err.statusCode = res.status;
    throw err;
  }
  return data as CreateBarbershopResponse;
}

/**
 * Fetch barbershop by id (e.g. for dashboard settings).
 */
export async function getBarbershopById(barbershopId: string): Promise<Barbershop> {
  const { data } = await api.get<Barbershop>(`/barbershops/${barbershopId}`);
  return data;
}

export interface UploadLogoResponse {
  message: string;
  barbershop: Barbershop;
}

/**
 * Upload barbershop logo (owner only).
 * Image is converted to WebP on the server and stored in Cloudinary.
 */
export async function uploadBarbershopLogo(
  barbershopId: string,
  file: File
): Promise<UploadLogoResponse> {
  const formData = new FormData();
  formData.append('logo', file);

  const { data } = await api.post<UploadLogoResponse>(
    `/barbershops/${barbershopId}/logo`,
    formData
  );

  return data;
}
