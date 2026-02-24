import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from './api';
import type { CurrentSubscription, SubscriptionMeResponse } from '@/types';

/**
 * Fetch current subscription + plan for the authenticated user's barbershop.
 */
export async function getCurrentSubscription(): Promise<SubscriptionMeResponse> {
  const { data } = await api.get<SubscriptionMeResponse>('/subscriptions/me');
  return data;
}

/**
 * Change plan (upgrade/downgrade). Owner only. On downgrade, backend may return 400 if barber count exceeds new plan limit.
 */
export async function updatePlan(planId: string): Promise<SubscriptionMeResponse> {
  const { data } = await api.patch<SubscriptionMeResponse>('/subscriptions/me/plan', {
    planId,
  });
  return data;
}

/** Label for subscription status badge. */
export function formatSubscriptionBadge(subscription: CurrentSubscription | null): string {
  if (!subscription) return 'Sem assinatura';
  if (subscription.status === 'trial' && subscription.trialEndsAt) {
    return `Trial até ${format(parseISO(subscription.trialEndsAt), 'dd/MM', { locale: ptBR })}`;
  }
  if (subscription.status === 'active') {
    return `Plano ativo até ${format(parseISO(subscription.currentPeriodEnd), 'dd/MM', { locale: ptBR })}`;
  }
  if (subscription.status === 'suspended' || subscription.status === 'cancelled') {
    return 'Assinatura suspensa';
  }
  return subscription.plan.name;
}

/** Days left until trial ends; null if not trial or no trialEndsAt. */
export function getTrialDaysLeft(subscription: CurrentSubscription | null): number | null {
  if (!subscription || subscription.status !== 'trial' || !subscription.trialEndsAt) return null;
  const end = new Date(subscription.trialEndsAt).getTime();
  const now = Date.now();
  const days = Math.ceil((end - now) / (24 * 60 * 60 * 1000));
  return days;
}

/** Contract: only these statuses allow full dashboard access. Trial expired is treated as suspended by backend (on read). */
const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trial'] as const;

/** True when user has an active or trial subscription (allow dashboard). False = show expiration screen (except billing routes). */
export function hasActiveOrTrialSubscription(subscription: CurrentSubscription | null): boolean {
  if (!subscription) return false;
  return ACTIVE_SUBSCRIPTION_STATUSES.includes(
    subscription.status as (typeof ACTIVE_SUBSCRIPTION_STATUSES)[number]
  );
}

/** True when subscription is not active/trial → block dashboard and show expiration (suspended, cancelled, or no subscription). */
export function isSubscriptionExpired(subscription: CurrentSubscription | null): boolean {
  return !hasActiveOrTrialSubscription(subscription);
}
