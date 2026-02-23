'use client';

import { UserGroupIcon } from '@heroicons/react/24/outline';

export default function ClientsPage() {
  return (
    <div className="px-4 pb-24 pt-6 sm:px-6 sm:pb-8">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <UserGroupIcon className="mx-auto h-12 w-12 text-zinc-300" aria-hidden />
        <p className="mt-3 font-medium text-zinc-600">Clientes</p>
        <p className="mt-1 text-sm text-zinc-500">Em breve: listar e gerenciar clientes.</p>
      </div>
    </div>
  );
}
