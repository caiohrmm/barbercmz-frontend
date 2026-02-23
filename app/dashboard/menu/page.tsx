'use client';

import { useAuth } from '@/lib/providers/auth-provider';
import Link from 'next/link';
import {
  ScissorsIcon,
  UserGroupIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const items = [
  { href: '/dashboard/services', label: 'Serviços', description: 'Preços e duração', icon: ScissorsIcon },
  { href: '/dashboard/clients', label: 'Clientes', description: 'Lista e histórico', icon: UserGroupIcon },
  { href: '/dashboard/billing', label: 'Faturamento', description: 'Planos e pagamentos', icon: BanknotesIcon },
  { href: '/dashboard/settings', label: 'Configurações', description: 'Logo e dados da barbearia', icon: Cog6ToothIcon },
];

export default function MenuPage() {
  const { user } = useAuth();
  const visibleItems = user?.role === 'owner' ? items : items.filter((i) => i.href !== '/dashboard/billing');

  return (
    <div className="px-4 pb-24 pt-6 sm:px-6 sm:pb-8">
      <p className="mb-6 text-sm text-zinc-500">
        Acesso rápido às áreas do painel.
      </p>
      <ul className="space-y-1" role="list">
        {visibleItems.map(({ href, label, description, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm transition hover:border-amber-200 hover:bg-amber-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 text-left">
                <p className="font-semibold text-zinc-900">{label}</p>
                <p className="text-sm text-zinc-500">{description}</p>
              </div>
              <ChevronRightIcon className="h-5 w-5 shrink-0 text-zinc-400" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
