'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  UserIcon,
  PhoneIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { getAppointments, updateAppointmentStatus } from '@/lib/appointments';
import type { Appointment, AppointmentStatus } from '@/types';
import { format, startOfDay, endOfDay, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  scheduled: 'Agendado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Faltou',
};

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  scheduled: 'bg-amber-100 text-amber-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-zinc-100 text-zinc-600',
  no_show: 'bg-red-100 text-red-800',
};

function formatTime(iso: string): string {
  return format(new Date(iso), 'HH:mm', { locale: ptBR });
}

export default function AgendaPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('scheduled');
  const [dateAnchor, setDateAnchor] = useState(() => new Date());

  const startDate = startOfDay(dateAnchor).toISOString();
  const endDate = endOfDay(dateAnchor).toISOString();

  const { data, isLoading, error } = useQuery({
    queryKey: ['appointments', statusFilter === 'all' ? undefined : statusFilter, startDate, endDate],
    queryFn: () =>
      getAppointments({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        startDate,
        endDate,
      }),
  });

  const [statusUpdateMessage, setStatusUpdateMessage] = useState<string | null>(null);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      updateAppointmentStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setStatusUpdateMessage(`Marcado como ${STATUS_LABEL[variables.status].toLowerCase()}`);
    },
  });

  useEffect(() => {
    if (!statusUpdateMessage) return;
    const t = setTimeout(() => setStatusUpdateMessage(null), 3000);
    return () => clearTimeout(t);
  }, [statusUpdateMessage]);

  const appointments = data?.appointments ?? [];

  return (
    <div className="px-4 pb-6 pt-6 sm:px-6">
        {/* Filtro de data */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDateAnchor((d) => subDays(d, 1))}
              className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Dia anterior"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div className="min-w-[10rem] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-center text-sm font-medium text-zinc-900">
              <CalendarDaysIcon className="mx-auto mb-0.5 inline h-4 w-4 text-zinc-400" />
              {format(dateAnchor, "EEEE, d 'de' MMM", { locale: ptBR })}
            </div>
            <button
              type="button"
              onClick={() => setDateAnchor((d) => addDays(d, 1))}
              className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Próximo dia"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setDateAnchor(new Date())}
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Hoje
          </button>
        </div>

        {/* Feedback de status atualizado */}
        {statusUpdateMessage && (
          <div
            className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            role="status"
            aria-live="polite"
          >
            <CheckCircleIcon className="h-5 w-5 shrink-0 text-green-600" aria-hidden />
            <span>{statusUpdateMessage}</span>
          </div>
        )}

        {/* Filtro de status */}
        <div className="mb-6">
          <label id="agenda-status-label" className="mb-2 block text-sm font-medium text-zinc-700">
            Status
          </label>
          <div className="relative">
            <Listbox value={statusFilter} onChange={setStatusFilter}>
              <ListboxButton
                className="relative w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                aria-labelledby="agenda-status-label"
              >
                <span className="block truncate">
                  {statusFilter === 'all' ? 'Todos' : STATUS_LABEL[statusFilter]}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDownIcon className="h-5 w-5 text-zinc-400" />
                </span>
              </ListboxButton>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition duration-75 ease-in"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg focus:outline-none">
                  <ListboxOption value="all" className="cursor-pointer px-4 py-2 data-[selected]:bg-amber-50 data-[focus]:bg-zinc-50">
                    Todos
                  </ListboxOption>
                  {(Object.keys(STATUS_LABEL) as AppointmentStatus[]).map((s) => (
                    <ListboxOption key={s} value={s} className="cursor-pointer px-4 py-2 data-[selected]:bg-amber-50 data-[focus]:bg-zinc-50">
                      {STATUS_LABEL[s]}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </Transition>
            </Listbox>
          </div>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div
            className="flex flex-col items-center justify-center gap-3 py-12"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" aria-hidden />
            <p className="text-sm text-zinc-500">Carregando agendamentos...</p>
          </div>
        ) : error ? (
          <div
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
            role="alert"
          >
            <p className="font-medium text-red-800">Erro ao carregar agendamentos</p>
            <p className="mt-1 text-sm text-red-700">Tente novamente em instantes.</p>
          </div>
        ) : appointments.length === 0 ? (
          <div
            className="rounded-2xl border border-zinc-200 bg-white p-8 text-center"
            role="status"
          >
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-zinc-300" aria-hidden />
            <p className="mt-3 font-medium text-zinc-600">Nenhum agendamento neste dia</p>
            <p className="mt-1 text-sm text-zinc-500">
              Altere a data ou o filtro de status para ver outros resultados.
            </p>
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {appointments.map((apt) => (
              <AgendaCard
                key={apt.id}
                appointment={apt}
                onStatusChange={(status) => updateStatus.mutate({ id: apt.id, status })}
                isUpdating={updateStatus.isPending && updateStatus.variables?.id === apt.id}
              />
            ))}
          </ul>
        )}
    </div>
  );
}

function AgendaCard({
  appointment,
  onStatusChange,
  isUpdating,
}: {
  appointment: Appointment;
  onStatusChange: (status: AppointmentStatus) => void;
  isUpdating: boolean;
}) {
  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-zinc-400" aria-hidden />
            <span className="font-semibold text-zinc-900">
              {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
            </span>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[appointment.status]}`}
          >
            {STATUS_LABEL[appointment.status]}
          </span>
        </div>

        {appointment.customer && (
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <UserIcon className="h-4 w-4 shrink-0 text-zinc-400" />
            <span>{appointment.customer.name}</span>
          </div>
        )}
        {appointment.customer?.phone && (
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <PhoneIcon className="h-4 w-4 shrink-0 text-zinc-400" />
            <a href={`tel:${appointment.customer.phone}`} className="hover:underline">
              {appointment.customer.phone}
            </a>
          </div>
        )}
        {appointment.service && (
          <p className="text-sm text-zinc-600">
            {appointment.service.name}
            {appointment.barber && ` · ${appointment.barber.name}`}
          </p>
        )}

        {appointment.status === 'scheduled' && (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onStatusChange('completed')}
              disabled={isUpdating}
              aria-busy={isUpdating}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
            >
              {isUpdating ? 'Salvando...' : 'Concluir'}
            </button>
            <button
              type="button"
              onClick={() => onStatusChange('no_show')}
              disabled={isUpdating}
              className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-60"
            >
              Faltou
            </button>
            <button
              type="button"
              onClick={() => onStatusChange('cancelled')}
              disabled={isUpdating}
              className="rounded-lg bg-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
