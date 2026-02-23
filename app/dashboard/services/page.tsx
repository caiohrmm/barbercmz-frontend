'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ServicesPage() {
  return (
    <div className="p-4">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg p-1 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          aria-label="Voltar ao dashboard"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">Serviços</h1>
      </div>
      <p className="text-zinc-600">Em breve: gerenciar serviços oferecidos.</p>
    </div>
  );
}
