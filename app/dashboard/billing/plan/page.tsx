'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { AxiosError } from 'axios';
import { getPlans } from '@/lib/plans';
import { getCurrentSubscription, updatePlan } from '@/lib/subscriptions';
import { useAuth } from '@/lib/providers/auth-provider';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function BillingPlanPage() {
  const { user } = useAuth();
  const barbershopId = user?.barbershopId;
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: subscriptionData } = useQuery({
    queryKey: ['subscription', 'me'],
    queryFn: getCurrentSubscription,
    enabled: !!barbershopId,
  });
  const subscription = subscriptionData?.subscription ?? null;
  const currentPlanId = subscription?.plan?.id ?? null;
  const isOwner = user?.role === 'owner';

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
  });

  const changePlanMutation = useMutation({
    mutationFn: updatePlan,
    onSuccess: () => {
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['subscription', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['barbershop', barbershopId] });
    },
    onError: (err: AxiosError<{ error?: string; message?: string }>) => {
      const msg =
        err.response?.data?.error ??
        err.response?.data?.message ??
        'Não foi possível alterar o plano. Tente novamente.';
      setErrorMessage(msg);
    },
  });

  const handleChoosePlan = (planId: string) => {
    setErrorMessage(null);
    changePlanMutation.mutate(planId);
  };

  return (
    <div className="px-4 pb-24 pt-6 sm:px-6 sm:pb-8">
      <Link
        href="/dashboard/billing"
        className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-zinc-600 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        Voltar ao faturamento
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900 sm:text-2xl">Mudar plano</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Escolha um plano para definir quantos barbeiros podem ser cadastrados.
      </p>
      <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
        30 dias grátis em qualquer plano para demonstrar o sistema.
      </p>

      {errorMessage && (
        <div
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="mt-6 flex justify-center py-12">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"
            aria-hidden
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const isChanging = changePlanMutation.isPending && changePlanMutation.variables === plan.id;
            return (
              <li
                key={plan.id}
                className={`rounded-2xl border-2 p-5 shadow-sm ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-50/50'
                    : 'border-zinc-200 bg-white'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-zinc-900">{plan.name}</h2>
                      {isCurrent && (
                        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
                          Plano atual
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-lg font-medium text-amber-600">
                      {formatPrice(plan.priceMonthly)}/mês
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Até <strong>{plan.maxBarbers}</strong> barbeiro{plan.maxBarbers !== 1 ? 's' : ''}
                    </p>
                    {plan.features && plan.features.length > 0 && (
                      <ul className="mt-3 space-y-1 text-sm text-zinc-600">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 shrink-0 text-green-500" aria-hidden />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="shrink-0">
                    {isCurrent ? (
                      <span
                        className="inline-flex cursor-not-allowed items-center rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-500"
                        aria-disabled="true"
                      >
                        Plano atual
                      </span>
                    ) : !isOwner ? (
                      <span className="text-sm text-zinc-500">
                        Apenas o dono pode alterar o plano.
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleChoosePlan(plan.id)}
                        disabled={changePlanMutation.isPending}
                        className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isChanging ? (
                          <>
                            <span
                              className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"
                              aria-hidden
                            />
                            Alterando…
                          </>
                        ) : (
                          'Escolher este plano'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!isLoading && plans.length === 0 && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <p className="font-medium text-zinc-600">Nenhum plano disponível no momento.</p>
        </div>
      )}
    </div>
  );
}
