'use client';

import { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  PlusIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import {
  getAppointments,
  updateAppointmentStatus,
  createInternalAppointment,
} from '@/lib/appointments';
import { getServices } from '@/lib/services';
import { getBarbers } from '@/lib/barbers';
import { bookingCustomerSchema, type BookingCustomerInput } from '@/lib/validators';
import { useAuth } from '@/lib/providers/auth-provider';
import type { Appointment, AppointmentStatus, Barber, Service } from '@/types';
import { format, startOfDay, endOfDay, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';

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

function formatPhoneMask(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  if (d[2] === '9') {
    if (d.length <= 3) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}

type QuickAppointmentFormValues = BookingCustomerInput & {
  serviceId: string;
  barberId: string;
  time: string;
};

const quickAppointmentSchema = bookingCustomerSchema.extend({
  serviceId: z.string().min(1, 'Selecione um serviço'),
  barberId: z.string().min(1, 'Selecione um barbeiro'),
  time: z.string().min(1, 'Informe o horário'),
});

export default function AgendaPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('scheduled');
  const [dateAnchor, setDateAnchor] = useState(() => new Date());
  const [isCreating, setIsCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);

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

  const { data: servicesData } = useQuery({
    queryKey: ['services', 'active'],
    queryFn: () => getServices({ active: true }),
  });

  const { data: barbersData } = useQuery({
    queryKey: ['barbers', 'active'],
    queryFn: () => getBarbers(true),
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuickAppointmentFormValues>({
    resolver: zodResolver(quickAppointmentSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      serviceId: '',
      barberId: '',
      time: '',
    },
  });

  const createAppointment = useMutation({
    mutationFn: async (values: QuickAppointmentFormValues) => {
      if (!user?.barbershopId) {
        throw new Error('Barbearia não encontrada na sessão.');
      }
      const dateStr = format(dateAnchor, 'yyyy-MM-dd');
      const startTime = new Date(`${dateStr}T${values.time}:00`).toISOString();
      return createInternalAppointment({
        barbershopId: user.barbershopId,
        barberId: values.barberId,
        serviceId: values.serviceId,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        startTime,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setCreateMessage('Agendamento criado com sucesso');
      setIsCreating(false);
      reset();
    },
  });

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

  useEffect(() => {
    if (!createMessage) return;
    const t = setTimeout(() => setCreateMessage(null), 3000);
    return () => clearTimeout(t);
  }, [createMessage]);

  const appointments = data?.appointments ?? [];

  return (
    <div className="min-h-[100dvh] bg-zinc-50 px-3 pb-20 pt-4 sm:px-4">
      {/* Cabeçalho compacto para mobile */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setDateAnchor((d) => subDays(d, 1))}
            className="shrink-0 rounded-full border border-zinc-200 bg-white p-2 text-zinc-600 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Dia anterior"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <div className="inline-flex min-w-[9rem] items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900">
                <CalendarDaysIcon className="h-4 w-4 text-zinc-400" />
                <span className="truncate">
                  {format(dateAnchor, "EEEE, d 'de' MMM", { locale: ptBR })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDateAnchor(new Date())}
                className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                Hoje
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDateAnchor((d) => addDays(d, 1))}
            className="shrink-0 rounded-full border border-zinc-200 bg-white p-2 text-zinc-600 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Próximo dia"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Botão de criar agendamento em linha separada (mobile-first) */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setIsCreating((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 sm:w-auto sm:justify-start"
        >
          <PlusIcon className="h-4 w-4" aria-hidden />
          Criar agendamento
        </button>
      </div>

      {createMessage && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
          aria-live="polite"
        >
          <CheckCircleIcon className="h-5 w-5 shrink-0 text-green-600" aria-hidden />
          <span>{createMessage}</span>
        </div>
      )}

      {isCreating && (
        <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-zinc-900">Criar agendamento rápido</h2>
          <p className="mb-3 text-xs text-zinc-500">
            Use este formulário para registrar rapidamente um horário para um cliente que chegou na
            barbearia.
          </p>
          <form
            onSubmit={handleSubmit((values) => createAppointment.mutate(values))}
            className="space-y-3"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700">Serviço</label>
                <select
                  {...register('serviceId')}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">Selecione</option>
                  {servicesData?.services.map((service: Service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
                {errors.serviceId && (
                  <p className="mt-1 text-xs text-red-600">{errors.serviceId.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700">Barbeiro</label>
                <select
                  {...register('barberId')}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">Selecione</option>
                  {barbersData?.map((barber: Barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
                {errors.barberId && (
                  <p className="mt-1 text-xs text-red-600">{errors.barberId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700">Data</label>
                <input
                  type="date"
                  value={format(dateAnchor, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const value = e.target.value
                      ? new Date(`${e.target.value}T12:00:00`)
                      : new Date();
                    setDateAnchor(value);
                  }}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 [color-scheme:light]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700">Horário</label>
                <input
                  type="time"
                  {...register('time')}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 [color-scheme:light]"
                />
                {errors.time && (
                  <p className="mt-1 text-xs text-red-600">{errors.time.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700">
                  Nome do cliente
                </label>
                <input
                  type="text"
                  {...register('customerName')}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Ex: João Silva"
                />
                {errors.customerName && (
                  <p className="mt-1 text-xs text-red-600">{errors.customerName.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700">Telefone</label>
                <Controller
                  control={control}
                  name="customerPhone"
                  render={({ field }) => (
                    <input
                      type="tel"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const masked = formatPhoneMask(e.target.value);
                        field.onChange(masked);
                      }}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      placeholder="(11) 99999-9999"
                    />
                  )}
                />
                {errors.customerPhone && (
                  <p className="mt-1 text-xs text-red-600">{errors.customerPhone.message}</p>
                )}
              </div>
            </div>

            {createAppointment.isError && (
              <p className="text-xs text-red-600">
                {(createAppointment.error as Error)?.message ??
                  'Não foi possível criar o agendamento.'}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  reset();
                }}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createAppointment.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
              >
                {createAppointment.isPending ? 'Salvando...' : 'Salvar agendamento'}
              </button>
            </div>
          </form>
        </div>
      )}

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
                <ListboxOption
                  value="all"
                  className="cursor-pointer px-4 py-2 text-sm text-zinc-700 data-[selected]:bg-amber-50 data-[selected]:text-amber-900 data-[focus]:bg-zinc-50"
                >
                  Todos
                </ListboxOption>
                {(Object.keys(STATUS_LABEL) as AppointmentStatus[]).map((s) => (
                  <ListboxOption
                    key={s}
                    value={s}
                    className="cursor-pointer px-4 py-2 text-sm text-zinc-700 data-[selected]:bg-amber-50 data-[selected]:text-amber-900 data-[focus]:bg-zinc-50"
                  >
                    {STATUS_LABEL[s]}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </Listbox>
        </div>
      </div>

      {isLoading ? (
        <div
          className="flex flex-col items-center justify-center gap-3 py-12"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"
            aria-hidden
          />
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
