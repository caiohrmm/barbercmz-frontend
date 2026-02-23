import api from './api';
import type { Service } from '@/types';

export interface GetServicesParams {
  active?: boolean;
}

export interface GetServicesResponse {
  services: Service[];
  count: number;
}

export async function getServices(params?: GetServicesParams): Promise<GetServicesResponse> {
  const { data } = await api.get<GetServicesResponse>('/services', {
    params: params?.active !== undefined ? { active: String(params.active) } : undefined,
  });
  return data;
}

export interface CreateServiceInput {
  name: string;
  duration: number;
  price: number;
}

export async function createService(
  input: CreateServiceInput
): Promise<{ message: string; service: Service }> {
  const { data } = await api.post<{ message: string; service: Service }>('/services', input);
  return data;
}

export interface UpdateServiceInput {
  name?: string;
  duration?: number;
  price?: number;
  active?: boolean;
}

export async function updateService(
  id: string,
  input: UpdateServiceInput
): Promise<{ message: string; service: Service }> {
  const { data } = await api.patch<{ message: string; service: Service }>(`/services/${id}`, input);
  return data;
}

export async function deleteService(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/services/${id}`);
  return data;
}
