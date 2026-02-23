'use client';

import { useAuth } from '@/lib/providers/auth-provider';
import Link from 'next/link';
import {
  CalendarDaysIcon,
  ScissorsIcon,
  UserGroupIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

export default function DashboardPage() {
  const { user } = useAuth();

  const mainLinks = [
    { href: '/dashboard/agenda', label: 'Agenda', description: 'Ver e gerenciar agendamentos de hoje', icon: CalendarDaysIcon, primary: true },
    { href: '/dashboard/menu', label: 'Menu', description: 'Serviços, clientes, configurações', icon: Cog6ToothIcon, primary: false },
  ];

  const ownerLinks =
    user?.role === 'owner'
      ? [
          { href: '/dashboard/services', label: 'Serviços', icon: ScissorsIcon },
          { href: '/dashboard/clients', label: 'Clientes', icon: UserGroupIcon },
          { href: '/dashboard/billing', label: 'Faturamento', icon: BanknotesIcon },
          { href: '/dashboard/settings', label: 'Configurações', icon: Cog6ToothIcon },
        ]
      : [];

  return (
    <div className="px-4 pb-24 pt-6 sm:px-6 sm:pb-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-amber-600">{format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
        <h2 className="mt-1 text-2xl font-bold text-zinc-900 sm:text-3xl">
          {greeting()}, {user?.name?.split(' ')[0] ?? 'você'}
        </h2>
      </div>

      <section className="mb-8">
        <h3 className="sr-only">Ações rápidas</h3>
        <ul className="grid gap-3 sm:grid-cols-2" role="list">
          {mainLinks.map(({ href, label, description, icon: Icon, primary }) => (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-start gap-4 rounded-2xl border-2 p-4 transition focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  primary
                    ? 'border-amber-200 bg-amber-50/50 hover:border-amber-300 hover:bg-amber-50'
                    : 'border-zinc-200 bg-white shadow-sm hover:border-zinc-300 hover:shadow'
                }`}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    primary ? 'bg-amber-500 text-white' : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-900">{label}</p>
                  <p className="text-sm text-zinc-500">{description}</p>
                </div>
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-zinc-400" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {ownerLinks.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Áreas do painel
          </h3>
          <ul className="space-y-2" role="list">
            {ownerLinks.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 shadow-sm transition hover:border-amber-200 hover:bg-amber-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="flex-1 font-medium text-zinc-900">{label}</span>
                  <ChevronRightIcon className="h-5 w-5 shrink-0 text-zinc-400" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
