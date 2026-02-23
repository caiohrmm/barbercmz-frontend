'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { getPlans } from '@/lib/plans';
import { getBarbershopById } from '@/lib/barbershop';
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

  const { data: barbershop } = useQuery({
    queryKey: ['barbershop', barbershopId],
    queryFn: () => getBarbershopById(barbershopId!),
    enabled: !!barbershopId,
  });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
  });

  const currentPlanId = barbershop?.planId;

  return (
    <div className="px-4 pb-24 pt-6 sm:px-6 sm:pb-8">
      <Link
        href="/dashboard/billing"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        Voltar ao faturamento
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900 sm:text-2xl">Mudar plano</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Escolha um plano para definir quantos barbeiros podem ser cadastrados.
      </p>

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
            return (
              <li
                key={plan.id}
                className={`rounded-2xl border-2 p-5 shadow-sm ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-50/50'
                    : 'border-zinc-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-zinc-900">{plan.name}</h2>
                      {isCurrent && (
                        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
                          Atual
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
                </div>
                {!isCurrent && (
                  <p className="mt-4 text-xs text-zinc-500">
                    Alteração de plano em breve pelo painel. Entre em contato para upgrade.
                  </p>
                )}
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
