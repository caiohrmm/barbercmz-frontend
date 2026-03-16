import api from './api';
import type { Appointment } from '@/types';

export interface GetAppointmentsParams {
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  barberId?: string;
  customerId?: string;
  startDate?: string; // ISO
  endDate?: string;   // ISO
}

export interface GetAppointmentsResponse {
  appointments: Appointment[];
  count: number;
}

export async function getAppointments(
  params?: GetAppointmentsParams
): Promise<GetAppointmentsResponse> {
  const { data } = await api.get<GetAppointmentsResponse>('/appointments', {
    params,
  });
  return data;
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment['status']
): Promise<{ message: string; appointment: Appointment }> {
  const { data } = await api.patch<{ message: string; appointment: Appointment }>(
    `/appointments/${id}/status`,
    { status }
  );
  return data;
}

export interface CreateInternalAppointmentInput {
  barbershopId: string;
  barberId: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  startTime: string; // ISO
}

export async function createInternalAppointment(
  input: CreateInternalAppointmentInput
): Promise<{ message: string; appointment: Appointment }> {
  const { data } = await api.post<{ message: string; appointment: Appointment }>(
    '/appointments/internal',
    input
  );
  return data;
}
