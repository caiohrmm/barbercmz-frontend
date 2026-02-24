import api from './api';

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type PaymentMethod = 'pix' | 'card' | 'boleto';

export interface PaymentItem {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  paidAt: string | null;
  createdAt: string;
}

export interface PaymentsMeResponse {
  payments: PaymentItem[];
}

/**
 * List payments for the current barbershop's subscription (owner only).
 */
export async function getPayments(): Promise<PaymentsMeResponse> {
  const { data } = await api.get<PaymentsMeResponse>('/payments/me');
  return data;
}

/**
 * Create a mock payment (development only). Backend returns 403 in production.
 */
export async function createMockPayment(): Promise<{ payment: PaymentItem }> {
  const { data } = await api.post<{ payment: PaymentItem }>('/payments/mock');
  return data;
}
