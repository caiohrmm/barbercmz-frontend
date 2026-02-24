'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/providers/auth-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserGroupIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getBarbershopById } from '@/lib/barbershop';
import { getPlans } from '@/lib/plans';
import { getBarbers } from '@/lib/barbers';
import { getCurrentSubscription, formatSubscriptionBadge, getTrialDaysLeft } from '@/lib/subscriptions';
import { getPayments, createMockPayment } from '@/lib/payments';
import type { Plan } from '@/types';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatPaymentStatus(status: string): string {
  const labels: Record<string, string> = {
    paid: 'Pago',
    pending: 'Pendente',
    failed: 'Falhou',
    refunded: 'Reembolsado',
  };
  return labels[status] ?? status;
}

function formatPaymentMethod(method: string): string {
  const labels: Record<string, string> = {
    card: 'Cartão',
    pix: 'PIX',
    boleto: 'Boleto',
  };
  return labels[method] ?? method;
}

export default function BillingPage() {
  const { user } = useAuth();
  const barbershopId = user?.barbershopId;

  const { data: barbershop, isLoading: loadingBarbershop } = useQuery({
    queryKey: ['barbershop', barbershopId],
    queryFn: () => getBarbershopById(barbershopId!),
    enabled: !!barbershopId,
  });

  const { data: plans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
  });

  const { data: barbers = [], isLoading: loadingBarbers } = useQuery({
    queryKey: ['barbers'],
    queryFn: () => getBarbers(),
    enabled: !!barbershopId,
  });

  const { data: subscriptionData } = useQuery({
    queryKey: ['subscription', 'me'],
    queryFn: getCurrentSubscription,
    enabled: !!barbershopId,
  });
  const subscription = subscriptionData?.subscription ?? null;
  const currentPlan: Plan | undefined = subscription?.plan
    ? { ...subscription.plan, active: true, createdAt: '', updatedAt: '' }
    : barbershop?.planId
      ? plans.find((p) => p.id === barbershop.planId)
      : undefined;
  const maxBarbers = barbershop?.maxBarbers ?? 1;
  const trialDaysLeft = getTrialDaysLeft(subscription);
  const showTrialWarning = trialDaysLeft !== null && trialDaysLeft <= 7;
  const activeBarbers = barbers.filter((b) => b.active);
  const barberCount = activeBarbers.length;
  const isOwner = user?.role === 'owner';

  const { data: paymentsData, isLoading: loadingPayments } = useQuery({
    queryKey: ['payments', 'me'],
    queryFn: getPayments,
    enabled: !!barbershopId && isOwner,
  });
  const payments = paymentsData?.payments ?? [];

  const queryClient = useQueryClient();
  const mockPaymentMutation = useMutation({
    mutationFn: createMockPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'me'] });
    },
  });

  const isLoading = loadingBarbershop || loadingPlans || loadingBarbers;
  const subscriptionBadge = formatSubscriptionBadge(subscription);
  const isDev = process.env.NODE_ENV === 'development';

  if (!barbershopId) {
    return (
      <div className="px-4 pb-24 pt-6 sm:px-6 sm:pb-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <p className="font-medium text-zinc-600">Acesso não disponível.</p>
        </div>
      </div>
    );
  }

  if (isLoading && !barbershop) {
    return (
      <div className="px-4 pb-24 pt-6 sm:px-6 sm:pb-8">
        <div className="flex items-center justify-center py-12">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"
            aria-hidden
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 pt-6 sm:px-6 sm:pb-8">
      <h1 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Faturamento</h1>
      <p className="mt-1 text-sm text-zinc-500">Plano, limite de barbeiros e equipe.</p>
      <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Todos os planos incluem 30 dias grátis para demonstração do sistema.
      </p>

      {showTrialWarning && (
        <div
          className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
          <p>
            <strong>Seu trial termina em {trialDaysLeft} {trialDaysLeft === 1 ? 'dia' : 'dias'}.</strong>
            {' '}Faça upgrade para continuar usando o sistema sem interrupções.
          </p>
        </div>
      )}

      {/* Plano atual */}
      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-800">Plano atual</h2>
        {barbershop && (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-zinc-900">
                {currentPlan ? currentPlan.name : 'Plano gratuito'}
              </p>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  subscription?.status === 'trial'
                    ? 'bg-amber-100 text-amber-800'
                    : subscription?.status === 'suspended' || subscription?.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                }`}
              >
                {subscriptionBadge}
              </span>
            </div>
            {subscription && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-600">
                <span className="flex items-center gap-1.5">
                  <CalendarDaysIcon className="h-4 w-4 text-zinc-400" aria-hidden />
                  Período: {format(parseISO(subscription.currentPeriodStart), 'dd/MM/yyyy', { locale: ptBR })} – {format(parseISO(subscription.currentPeriodEnd), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
                {subscription.status === 'trial' && subscription.trialEndsAt && (
                  <span className="text-amber-700">
                    Trial até {format(parseISO(subscription.trialEndsAt), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                )}
              </div>
            )}
            {currentPlan && (
              <p className="text-sm text-zinc-500">
                {formatPrice(currentPlan.priceMonthly)}/mês
              </p>
            )}
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <UserGroupIcon className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
              <span>
                <strong>{barberCount}</strong> de <strong>{maxBarbers}</strong> barbeiros
                cadastrados
              </span>
            </div>
            {currentPlan?.features && currentPlan.features.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-zinc-600">
                {currentPlan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 shrink-0 text-green-500" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/dashboard/billing/plan"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded"
            >
              Mudar plano
              <ChevronRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        )}
      </section>

      {/* Barbeiros cadastrados */}
      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-800">Barbeiros cadastrados</h2>
          <Link
            href="/dashboard/barbers"
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded"
          >
            Gerenciar
            <ChevronRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        {loadingBarbers ? (
          <div className="flex justify-center py-8">
            <div
              className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"
              aria-hidden
            />
          </div>
        ) : barbers.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <UserGroupIcon className="mx-auto h-10 w-10 text-zinc-300" aria-hidden />
            <p className="mt-2 text-sm font-medium text-zinc-600">Nenhum barbeiro cadastrado</p>
            <p className="mt-1 text-sm text-zinc-500">
              Adicione barbeiros em Gerenciar para aparecer na agenda.
            </p>
            <Link
              href="/dashboard/barbers"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              Adicionar barbeiro
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {barbers.map((barber) => (
              <li key={barber.id}>
                <Link
                  href="/dashboard/barbers"
                  className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
                >
                  <span className="font-medium text-zinc-900">{barber.name}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      barber.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {barber.active ? 'Ativo' : 'Inativo'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Histórico de pagamentos (owner) */}
      {isOwner && (
        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-800">Histórico de pagamentos</h2>
            {isDev && (
              <button
                type="button"
                onClick={() => mockPaymentMutation.mutate()}
                disabled={mockPaymentMutation.isPending}
                className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {mockPaymentMutation.isPending ? 'Criando…' : '+ Pagamento de teste'}
              </button>
            )}
          </div>
          {loadingPayments ? (
            <div className="flex justify-center py-8">
              <div
                className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"
                aria-hidden
              />
            </div>
          ) : payments.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <BanknotesIcon className="mx-auto h-10 w-10 text-zinc-300" aria-hidden />
              <p className="mt-2 text-sm font-medium text-zinc-600">Nenhum pagamento registrado</p>
              <p className="mt-1 text-sm text-zinc-500">
                Quando houver faturas ou cobranças, elas aparecerão aqui.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {payments.map((payment) => (
                <li key={payment.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900">
                      {formatPrice(payment.amount)}
                      <span className="ml-1.5 text-xs font-normal text-zinc-500">
                        {formatPaymentMethod(payment.paymentMethod)}
                      </span>
                    </p>
                    <p className="text-xs text-zinc-500">
                      {payment.paidAt
                        ? format(parseISO(payment.paidAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                        : format(parseISO(payment.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      payment.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : payment.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {formatPaymentStatus(payment.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
