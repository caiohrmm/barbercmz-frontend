import api from './api';
import type { Customer } from '@/types';

export interface GetCustomersParams {
  blocked?: boolean;
  search?: string;
}

export interface GetCustomersResponse {
  customers: Customer[];
  count: number;
}

export async function getCustomers(params?: GetCustomersParams): Promise<GetCustomersResponse> {
  const query: Record<string, string> = {};
  if (params?.blocked !== undefined) query.blocked = String(params.blocked);
  if (params?.search?.trim()) query.search = params.search.trim();
  const { data } = await api.get<GetCustomersResponse>('/customers', {
    params: Object.keys(query).length ? query : undefined,
  });
  return data;
}

export async function blockCustomer(
  id: string,
  blocked: boolean
): Promise<{ message: string; customer: Customer }> {
  const { data } = await api.patch<{ message: string; customer: Customer }>(
    `/customers/${id}/block`,
    { blocked }
  );
  return data;
}
