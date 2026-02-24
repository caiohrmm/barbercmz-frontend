'use client';

import { useAuth } from '@/lib/providers/auth-provider';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarDaysIcon,
  ScissorsIcon,
  UserGroupIcon,
  UserPlusIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { format, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getAppointments } from '@/lib/appointments';
import { getBarbershopById } from '@/lib/barbershop';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

export default function DashboardPage() {
  const { user } = useAuth();
  const barbershopId = user?.barbershopId;
  const todayStart = startOfDay(new Date()).toISOString();
  const todayEnd = endOfDay(new Date()).toISOString();

  const { data: barbershop } = useQuery({
    queryKey: ['barbershop', barbershopId],
    queryFn: () => getBarbershopById(barbershopId!),
    enabled: !!barbershopId,
  });

  const { data: todayData } = useQuery({
    queryKey: ['appointments', 'today', todayStart, todayEnd],
    queryFn: () =>
      getAppointments({
        startDate: todayStart,
        endDate: todayEnd,
      }),
  });

  const todayCount =
    todayData?.appointments?.filter((a) => a.status === 'scheduled').length ?? 0;

  const listItems =
    user?.role === 'owner'
      ? [
          { href: '/dashboard/services', label: 'Serviços', icon: ScissorsIcon },
          { href: '/dashboard/clients', label: 'Clientes', icon: UserGroupIcon },
          { href: '/dashboard/barbers', label: 'Barbeiros', icon: UserPlusIcon },
          { href: '/dashboard/billing', label: 'Faturamento', icon: BanknotesIcon },
          { href: '/dashboard/settings', label: 'Configurações', icon: Cog6ToothIcon },
        ]
      : [
          { href: '/dashboard/services', label: 'Serviços', icon: ScissorsIcon },
          { href: '/dashboard/clients', label: 'Clientes', icon: UserGroupIcon },
          { href: '/dashboard/barbers', label: 'Barbeiros', icon: UserPlusIcon },
          { href: '/dashboard/settings', label: 'Configurações', icon: Cog6ToothIcon },
        ];

  return (
    <div className="px-4 pb-24 pt-6 sm:px-6 md:pb-8">
      <div className="mb-6 flex items-start gap-3">
        {barbershop?.logoUrl ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
            <Image
              src={barbershop.logoUrl}
              alt=""
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-amber-600">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-900 sm:text-3xl">
            {greeting()}
            {barbershop?.name ? `, ${barbershop.name}` : ''}
          </h2>
        </div>
      </div>

      <Link
        href="/dashboard/agenda"
        className="mb-6 flex items-start gap-4 rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-4 transition hover:border-amber-300 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
          <CalendarDaysIcon className="h-6 w-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-zinc-900">Agenda de Hoje</p>
          <p className="mt-0.5 text-2xl font-bold text-zinc-900">
            {todayCount} {todayCount === 1 ? 'agendamento' : 'agendamentos'}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Ver e gerenciar agendamentos de hoje
          </p>
        </div>
        <ChevronRightIcon className="h-5 w-5 shrink-0 text-zinc-400" aria-hidden />
      </Link>

      <ul className="space-y-2" role="list">
        {listItems.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 shadow-sm transition hover:border-zinc-300 hover:shadow focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
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
    </div>
  );
}
