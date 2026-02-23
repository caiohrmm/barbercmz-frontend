import api from './api';
import type { Barbershop } from '@/types';

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
