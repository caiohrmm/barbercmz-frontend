import api from './api';
import type { Barber, WorkingHours } from '@/types';

export interface GetBarbersResponse {
  barbers: Barber[];
  count: number;
}

/**
 * List barbers for the current barbershop (auth required).
 * @param activeOnly - if true, only active barbers; if false, only inactive; if undefined, all
 */
export async function getBarbers(activeOnly?: boolean): Promise<Barber[]> {
  const params = new URLSearchParams();
  if (activeOnly === true) params.set('active', 'true');
  if (activeOnly === false) params.set('active', 'false');
  const { data } = await api.get<GetBarbersResponse>(
    `/barbers${params.toString() ? `?${params.toString()}` : ''}`
  );
  return data.barbers ?? [];
}

export interface CreateBarberInput {
  name: string;
  workingHours?: WorkingHours[];
  unavailableDates?: string[];
}

export interface CreateBarberResponse {
  message: string;
  barber: Barber;
}

export async function createBarber(input: CreateBarberInput): Promise<Barber> {
  const { data } = await api.post<CreateBarberResponse>('/barbers', input);
  return data.barber;
}

export interface UpdateBarberInput {
  name?: string;
  workingHours?: WorkingHours[];
  unavailableDates?: string[];
  active?: boolean;
}

export interface UpdateBarberResponse {
  message: string;
  barber: Barber;
}

export async function updateBarber(id: string, input: UpdateBarberInput): Promise<Barber> {
  const { data } = await api.patch<UpdateBarberResponse>(`/barbers/${id}`, input);
  return data.barber;
}

export interface DeleteBarberResponse {
  message: string;
}

export async function deleteBarber(id: string): Promise<void> {
  await api.delete<DeleteBarberResponse>(`/barbers/${id}`);
}
