'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  PhoneIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { getCustomers, blockCustomer } from '@/lib/customers';
import type { Customer } from '@/types';

function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length === 13 && d.startsWith('55')) {
    return `(${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  }
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  return phone;
}

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showBlocked, setShowBlocked] = useState<'all' | 'blocked' | 'active'>('active');

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', search || undefined, showBlocked],
    queryFn: () =>
      getCustomers({
        ...(search && { search }),
        ...(showBlocked === 'blocked' && { blocked: true }),
        ...(showBlocked === 'active' && { blocked: false }),
      }),
  });

  const blockMutation = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) => blockCustomer(id, blocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const customers = data?.customers ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <div className="px-4 pb-24 pt-6 sm:px-6 md:pb-8">
      {/* Busca */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nome ou telefone"
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              aria-label="Buscar cliente"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Filtro bloqueados */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { value: 'active' as const, label: 'Ativos' },
          { value: 'blocked' as const, label: 'Bloqueados' },
          { value: 'all' as const, label: 'Todos' },
        ].map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setShowBlocked(value)}
            className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
              showBlocked === value
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-zinc-500">
        {customers.length} {customers.length === 1 ? 'cliente' : 'clientes'}
        {search && ` para "${search}"`}
      </p>

      {isLoading ? (
        <div
          className="flex flex-col items-center justify-center gap-3 py-12"
          role="status"
          aria-busy="true"
        >
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"
            aria-hidden
          />
          <p className="text-sm text-zinc-500">Carregando clientes...</p>
        </div>
      ) : error ? (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
          role="alert"
        >
          <p className="font-medium text-red-800">Erro ao carregar clientes</p>
          <p className="mt-1 text-sm text-red-700">Tente novamente.</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <UserGroupIcon className="mx-auto h-12 w-12 text-zinc-300" aria-hidden />
          <p className="mt-3 font-medium text-zinc-600">
            {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {search
              ? 'Tente outro nome ou telefone.'
              : 'Os clientes aparecem aqui quando fazem agendamentos pela página pública.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3" role="list">
          {customers.map((customer) => (
            <li
              key={customer.id}
              className={`rounded-2xl border bg-white shadow-sm ${
                customer.blocked ? 'border-zinc-100 bg-zinc-50/50' : 'border-zinc-200'
              }`}
            >
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`font-semibold ${customer.blocked ? 'text-zinc-500' : 'text-zinc-900'}`}
                    >
                      {customer.name}
                    </p>
                    {customer.blocked && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                        <NoSymbolIcon className="h-3.5 w-3.5" aria-hidden />
                        Bloqueado
                      </span>
                    )}
                    {customer.noShowCount > 0 && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                        title="Faltas em agendamentos"
                      >
                        <ExclamationTriangleIcon className="h-3.5 w-3.5" aria-hidden />
                        {customer.noShowCount} falta{customer.noShowCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <a
                    href={`tel:${customer.phone}`}
                    className="mt-1 flex items-center gap-2 text-sm text-zinc-600 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white rounded"
                  >
                    <PhoneIcon className="h-4 w-4 shrink-0" aria-hidden />
                    {formatPhone(customer.phone)}
                  </a>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        customer.blocked
                          ? true
                          : confirm(
                              'Bloquear este cliente? Ele não poderá fazer novos agendamentos.'
                            )
                      ) {
                        blockMutation.mutate({
                          id: customer.id,
                          blocked: !customer.blocked,
                        });
                      }
                    }}
                    disabled={blockMutation.isPending && blockMutation.variables?.id === customer.id}
                    className={`rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 ${
                      customer.blocked
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {blockMutation.isPending && blockMutation.variables?.id === customer.id
                      ? 'Salvando...'
                      : customer.blocked
                        ? 'Desbloquear'
                        : 'Bloquear'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
