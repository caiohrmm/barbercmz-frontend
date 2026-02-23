import api from './api';
import type { Plan } from '@/types';

/**
 * Fetch active plans (public, used for pricing and billing).
 */
export async function getPlans(): Promise<Plan[]> {
  const { data } = await api.get<Plan[]>('/plans');
  return Array.isArray(data) ? data : [];
}
