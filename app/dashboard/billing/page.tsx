'use client';

import { BanknotesIcon } from '@heroicons/react/24/outline';

export default function BillingPage() {
  return (
    <div className="px-4 pb-24 pt-6 sm:px-6 sm:pb-8">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <BanknotesIcon className="mx-auto h-12 w-12 text-zinc-300" aria-hidden />
        <p className="mt-3 font-medium text-zinc-600">Faturamento</p>
        <p className="mt-1 text-sm text-zinc-500">Em breve: planos e pagamentos.</p>
      </div>
    </div>
  );
}
