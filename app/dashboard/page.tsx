'use client';

import { useAuth } from '@/lib/providers/auth-provider';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.name} ({user?.role})
          </span>
          <button
            onClick={logout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/agenda"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md"
        >
          <h2 className="mb-2 text-lg font-semibold">Agenda</h2>
          <p className="text-sm text-gray-600">Visualizar e gerenciar agendamentos</p>
        </Link>

        <Link
          href="/dashboard/services"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md"
        >
          <h2 className="mb-2 text-lg font-semibold">Serviços</h2>
          <p className="text-sm text-gray-600">Gerenciar serviços oferecidos</p>
        </Link>

        <Link
          href="/dashboard/clients"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md"
        >
          <h2 className="mb-2 text-lg font-semibold">Clientes</h2>
          <p className="text-sm text-gray-600">Listar e gerenciar clientes</p>
        </Link>

        {user?.role === 'owner' && (
          <>
            <Link
              href="/dashboard/billing"
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md"
            >
              <h2 className="mb-2 text-lg font-semibold">Faturamento</h2>
              <p className="text-sm text-gray-600">Visualizar faturamento e planos</p>
            </Link>

            <Link
              href="/dashboard/settings"
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md"
            >
              <h2 className="mb-2 text-lg font-semibold">Configurações</h2>
              <p className="text-sm text-gray-600">Configurações da barbearia</p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
