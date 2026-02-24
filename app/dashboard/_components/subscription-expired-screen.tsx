'use client';

import Link from 'next/link';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import { ROUTES } from '@/lib/constants';

export function SubscriptionExpiredScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12">
      <div className="max-w-sm rounded-2xl border border-amber-200 bg-amber-50/80 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <BanknotesIcon className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-zinc-900">
          Assinatura expirada
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Sua assinatura está suspensa ou expirada. Escolha um plano para
          reativar e continuar usando o sistema.
        </p>
        <Link
          href={ROUTES.DASHBOARD_BILLING_PLAN}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          Escolher um plano
        </Link>
        <p className="mt-4 text-xs text-zinc-500">
          Você também pode{' '}
          <Link
            href={ROUTES.DASHBOARD_BILLING}
            className="font-medium text-amber-700 underline hover:text-amber-800"
          >
            ver faturamento
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
