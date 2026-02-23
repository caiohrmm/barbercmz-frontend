'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Transition,
} from '@headlessui/react';
import {
  BanknotesIcon,
  ClockIcon,
  UserCircleIcon,
  PhoneIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ScissorsIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import type { Barbershop, Service } from '@/types';
import type { AvailableSlot } from '@/lib/public-api';
import { getAvailableSlots, createAppointment } from '@/lib/public-api';
import { bookingCustomerSchema, type BookingCustomerInput } from '@/lib/validators';
import { addDays, format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/** Máscara em tempo real: (XX) XXXX-XXXX (fixo) ou (XX) 9XXXX-XXXX (celular). */
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

const NEXT_DAYS = 21;

interface BookingStageOneProps {
  barbershop: Barbershop;
  services: Service[];
}

export function BookingStageOne({ barbershop, services }: BookingStageOneProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slotsError, setSlotsError] = useState(false);
  const [lastBookingSummary, setLastBookingSummary] = useState<{
    serviceName: string;
    date: string;
    time: string;
    barberName: string;
    appointmentId?: string;
  } | null>(null);
  const successButtonRef = useRef<HTMLButtonElement>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingCustomerInput>({
    resolver: zodResolver(bookingCustomerSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const today = new Date();
  const minDateStr = format(today, 'yyyy-MM-dd');
  const maxDateStr = format(addDays(today, NEXT_DAYS - 1), 'yyyy-MM-dd');

  useEffect(() => {
    if (!selectedService || !selectedDate) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setSelectedSlot(null);
    setSlotsError(false);
    getAvailableSlots(barbershop.id, selectedDate, selectedService.id)
      .then((res) => {
        if (!cancelled) setSlots(res.slots);
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setSlotsError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [barbershop.id, selectedService?.id, selectedDate]);

  const onConfirmBooking = handleSubmit(async (data) => {
    if (!selectedService || !selectedDate || !selectedSlot) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const startTime = new Date(`${selectedDate}T${selectedSlot.time}:00`).toISOString();
      const res = await createAppointment({
        barbershopId: barbershop.id,
        barberId: selectedSlot.barberId,
        serviceId: selectedService.id,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        startTime,
      });
      setLastBookingSummary({
        serviceName: selectedService.name,
        date: format(new Date(selectedDate + 'T12:00:00'), "EEEE, d 'de' MMMM", { locale: ptBR }),
        time: selectedSlot.time,
        barberName: selectedSlot.barberName,
        appointmentId: res.appointment?.id?.slice(-6),
      });
      setSubmitSuccess(true);
      reset();
    } catch (err) {
      const message =
        err instanceof Error && 'statusCode' in err
          ? err.message
          : 'Não foi possível confirmar. Tente novamente.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleAgendarOutro = () => {
    setSubmitSuccess(false);
    setSubmitError(null);
    setLastBookingSummary(null);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSlots([]);
    setSelectedTabIndex(0);
    reset();
  };

  useEffect(() => {
    if (submitSuccess && successButtonRef.current) {
      successButtonRef.current.focus();
    }
  }, [submitSuccess]);

  const stepComplete = [!!selectedService, !!selectedDate, !!selectedSlot, false] as const;
  const canGoToStep = (index: number) => {
    if (index === 0) return true;
    if (index === 1) return stepComplete[0];
    if (index === 2) return stepComplete[0] && stepComplete[1];
    if (index === 3) return stepComplete[0] && stepComplete[1] && stepComplete[2];
    return false;
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-50">
      <div className="px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        <div className="mx-auto max-w-lg">
          {/* Header */}
          <header className="border-b border-zinc-200 bg-white px-4 py-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-zinc-100">
                <Image
                  src="/logo.svg"
                  alt=""
                  width={64}
                  height={64}
                  className="object-contain p-2"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-zinc-900">
                  {barbershop.name}
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  Agendamento em 4 etapas
                </p>
              </div>
            </div>
          </header>

          {submitSuccess && lastBookingSummary ? (
            /* Sucesso - fora das tabs */
            <Transition
              show={submitSuccess}
              enter="transition duration-200 ease-out"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
            >
              <div
                className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center shadow-sm py-6"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <CheckCircleIcon className="mx-auto h-14 w-14 text-green-600" aria-hidden />
                <h3 className="mt-4 text-xl font-semibold text-green-900">
                  Agendamento confirmado!
                </h3>
                <p className="mt-2 text-sm text-green-800">
                  Guarde os detalhes abaixo para referência.
                </p>
                <dl className="mt-4 rounded-xl bg-white/60 p-4 text-left text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-green-800">Serviço</dt>
                    <dd className="font-medium text-green-900">{lastBookingSummary.serviceName}</dd>
                  </div>
                  <div className="mt-2 flex justify-between gap-2">
                    <dt className="text-green-800">Data</dt>
                    <dd className="font-medium text-green-900 capitalize">{lastBookingSummary.date}</dd>
                  </div>
                  <div className="mt-2 flex justify-between gap-2">
                    <dt className="text-green-800">Horário</dt>
                    <dd className="font-medium text-green-900">{lastBookingSummary.time}</dd>
                  </div>
                  <div className="mt-2 flex justify-between gap-2">
                    <dt className="text-green-800">Barbeiro</dt>
                    <dd className="font-medium text-green-900">{lastBookingSummary.barberName}</dd>
                  </div>
                  {lastBookingSummary.appointmentId && (
                    <div className="mt-2 flex justify-between gap-2 border-t border-green-200 pt-2">
                      <dt className="text-green-800">Nº ref.</dt>
                      <dd className="font-mono font-medium text-green-900">#{lastBookingSummary.appointmentId}</dd>
                    </div>
                  )}
                </dl>
                <p className="mt-3 text-xs text-green-700">
                  Você pode receber uma confirmação no telefone informado.
                </p>
                <button
                  type="button"
                  ref={successButtonRef}
                  onClick={handleAgendarOutro}
                  className="mt-5 rounded-xl bg-green-600 px-5 py-3 text-sm font-medium text-white shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-green-50"
                >
                  Fazer outro agendamento
                </button>
              </div>
            </Transition>
          ) : (
            <TabGroup
              selectedIndex={selectedTabIndex}
              onChange={setSelectedTabIndex}
              className="py-6"
            >
              <TabList className="flex gap-1 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
                {[
                  { label: 'Serviço', step: 0, icon: ScissorsIcon },
                  { label: 'Data', step: 1, icon: CalendarDaysIcon },
                  { label: 'Horário', step: 2, icon: ClockIcon },
                  { label: 'Dados', step: 3, icon: UserCircleIcon },
                ].map(({ label, step, icon: Icon }) => (
                  <Tab
                    key={step}
                    disabled={!canGoToStep(step)}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[selected]:border-amber-500 data-[selected]:bg-amber-50 data-[selected]:text-amber-900 data-[focus]:outline-none data-[focus]:ring-2 data-[focus]:ring-amber-500"
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {label}
                    {stepComplete[step] && <CheckIcon className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />}
                  </Tab>
                ))}
              </TabList>

              <TabPanels className="mt-4">
                {/* Etapa 1: Serviço */}
                <TabPanel className="focus:outline-none">
                  <section aria-labelledby="service-heading">
                    <h2 id="service-heading" className="mb-3 text-sm font-medium text-zinc-700">
                      1. Serviço
                    </h2>
              {services.length === 0 ? (
                <div
                  className="rounded-2xl border border-zinc-200 bg-white p-8 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <ScissorsIcon className="mx-auto h-12 w-12 text-zinc-300" aria-hidden />
                  <p className="mt-3 font-medium text-zinc-600">Nenhum serviço disponível</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Entre em contato com a barbearia para mais informações.
                  </p>
                </div>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2" role="list">
                  {services.map((service) => {
                    const isSelected = selectedService?.id === service.id;
                    return (
                      <li key={service.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedService(service)}
                          aria-pressed={isSelected}
                          aria-label={`${service.name}, ${formatDuration(service.duration)}, ${formatPrice(service.price)}`}
                          className={`flex w-full flex-col items-start rounded-2xl border p-4 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20'
                              : 'border-zinc-200 bg-white hover:border-amber-200 hover:bg-zinc-50'
                          }`}
                        >
                          <div className="flex w-full items-start justify-between gap-2">
                            <span className="font-medium text-zinc-900">{service.name}</span>
                            {isSelected && (
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                                <CheckIcon className="h-4 w-4" aria-hidden />
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-zinc-500">
                            <span>{formatDuration(service.duration)}</span>
                            <span className="font-medium text-amber-700">{formatPrice(service.price)}</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
            {selectedService && (
              <button
                type="button"
                onClick={() => setSelectedTabIndex(1)}
                className="mt-4 w-full rounded-xl bg-amber-500 py-3 font-medium text-zinc-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
              >
                Próximo: Data
              </button>
            )}
                  </TabPanel>

                {/* Etapa 2: Data */}
                <TabPanel className="focus:outline-none">
                  <section aria-labelledby="date-heading">
                    <h2 id="date-heading" className="mb-3 text-sm font-medium text-zinc-700">
                      2. Data
                    </h2>
                    <label htmlFor="booking-date" className="sr-only">
                      Escolha uma data (próximos {NEXT_DAYS} dias)
                    </label>
                    <input
                      id="booking-date"
                      type="date"
                      min={minDateStr}
                      max={maxDateStr}
                      value={selectedDate ?? ''}
                      onChange={(e) => setSelectedDate(e.target.value || null)}
                      aria-describedby="date-hint"
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-base text-zinc-900 shadow-sm [color-scheme:light] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                    />
                    <p id="date-hint" className="mt-2 text-sm text-zinc-500">
                      Próximos {NEXT_DAYS} dias. No celular, toque no campo para abrir o seletor de data.
                    </p>
                    {selectedDate && (
                      <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900" aria-live="polite">
                        {isToday(new Date(selectedDate + 'T12:00:00'))
                          ? 'Hoje'
                          : format(new Date(selectedDate + 'T12:00:00'), "EEEE, d 'de' MMMM", { locale: ptBR })}
                      </p>
                    )}
                  </section>
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedTabIndex(2)}
                className="mt-4 w-full rounded-xl bg-amber-500 py-3 font-medium text-zinc-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
              >
                Próximo: Horário
              </button>
            )}
                  </TabPanel>

                {/* Etapa 3: Horário */}
                <TabPanel className="focus:outline-none">
                  <section aria-labelledby="time-heading">
                    <h2 id="time-heading" className="mb-3 text-sm font-medium text-zinc-700">
                      3. Horário
                    </h2>
              {!selectedService || !selectedDate ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500">
                  Selecione serviço e data para ver horários.
                </div>
              ) : slotsLoading ? (
                <div
                  className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-10"
                  role="status"
                  aria-live="polite"
                  aria-busy="true"
                >
                  <div
                    className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"
                    aria-hidden
                  />
                  <span className="text-sm text-zinc-500">Buscando horários...</span>
                </div>
              ) : slotsError ? (
                <div
                  className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center"
                  role="alert"
                >
                  <p className="font-medium text-amber-900">Não foi possível carregar os horários</p>
                  <p className="mt-1 text-sm text-amber-800">
                    Tente novamente ou escolha outra data.
                  </p>
                </div>
              ) : slots.length === 0 ? (
                <div
                  className="rounded-2xl border border-zinc-200 bg-white p-8 text-center"
                  role="status"
                >
                  <CalendarDaysIcon className="mx-auto h-12 w-12 text-zinc-300" aria-hidden />
                  <p className="mt-3 font-medium text-zinc-600">Nenhum horário disponível neste dia</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Escolha outra data para ver os horários.
                  </p>
                </div>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2" role="list">
                  {slots.map((slot) => {
                    const isSelected =
                      selectedSlot?.time === slot.time && selectedSlot?.barberId === slot.barberId;
                    return (
                      <li key={`${slot.time}-${slot.barberId}`}>
                        <button
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          aria-pressed={isSelected}
                          aria-label={`${slot.time}, ${slot.barberName}`}
                          className={`flex w-full flex-col items-start rounded-2xl border p-4 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20'
                              : 'border-zinc-200 bg-white hover:border-amber-200 hover:bg-zinc-50'
                          }`}
                        >
                          <div className="flex w-full items-start justify-between gap-2">
                            <span className="flex items-center gap-2 font-medium text-zinc-900">
                              <ClockIcon className="h-5 w-5 shrink-0 text-zinc-500" aria-hidden />
                              {slot.time}
                            </span>
                            {isSelected && (
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                                <CheckIcon className="h-4 w-4" aria-hidden />
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-zinc-500">{slot.barberName}</p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
                  </section>
            {selectedSlot && (
              <button
                type="button"
                onClick={() => setSelectedTabIndex(3)}
                className="mt-4 w-full rounded-xl bg-amber-500 py-3 font-medium text-zinc-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
              >
                Próximo: Seus dados
              </button>
            )}
                  </TabPanel>

                {/* Etapa 4: Seus dados */}
                <TabPanel className="focus:outline-none">
                  {selectedService && selectedDate && selectedSlot ? (
              <section aria-labelledby="customer-heading">
                <h2 id="customer-heading" className="mb-3 text-sm font-medium text-zinc-700">
                  4. Seus dados
                </h2>
                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="mb-4 text-sm text-zinc-600">
                    {selectedService.name} ·{' '}
                    {format(new Date(selectedDate + 'T12:00:00'), "EEEE, d 'de' MMMM", { locale: ptBR })} às{' '}
                    {selectedSlot.time} · {selectedSlot.barberName}
                  </p>

                  {submitError && (
                    <div
                      className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                      role="alert"
                    >
                      {submitError}
                    </div>
                  )}

                  <form onSubmit={onConfirmBooking} className="space-y-4">
                    <div>
                      <label htmlFor="booking-name" className="block text-sm font-medium text-zinc-700">
                        Nome
                      </label>
                      <div className="relative mt-1">
                        <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" aria-hidden />
                        <input
                          {...register('customerName')}
                          type="text"
                          id="booking-name"
                          autoComplete="name"
                          placeholder="Seu nome"
                          disabled={isSubmitting}
                          className="w-full rounded-xl border border-zinc-300 py-3 pl-11 pr-4 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                        />
                      </div>
                      {errors.customerName && (
                        <p className="mt-1 text-sm text-red-600" role="alert">
                          {errors.customerName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="booking-phone" className="block text-sm font-medium text-zinc-700">
                        Telefone
                      </label>
                      <div className="relative mt-1">
                        <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" aria-hidden />
                        <Controller
                          control={control}
                          name="customerPhone"
                          render={({ field }) => (
                            <input
                              {...field}
                              type="tel"
                              id="booking-phone"
                              autoComplete="tel"
                              placeholder="(11) 99999-9999"
                              disabled={isSubmitting}
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const masked = formatPhoneMask(e.target.value);
                                field.onChange(masked);
                              }}
                              className="w-full rounded-xl border border-zinc-300 py-3 pl-11 pr-4 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                            />
                          )}
                        />
                      </div>
                      {errors.customerPhone && (
                        <p className="mt-1 text-sm text-red-600" role="alert">
                          {errors.customerPhone.message}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-zinc-500">
                        Com DDD. Celular: (11) 99999-9999 · Fixo: (11) 3333-3333
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 px-4 font-medium text-zinc-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <ArrowPathIcon className="h-5 w-5 animate-spin" aria-hidden />
                          Confirmando...
                        </>
                      ) : (
                        'Confirmar agendamento'
                      )}
                    </button>
                  </form>
                </div>
              </section>
                  ) : (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
                      <UserCircleIcon className="mx-auto h-12 w-12 text-zinc-300" aria-hidden />
                      <p className="mt-3 font-medium text-zinc-600">Complete as etapas anteriores</p>
                      <p className="mt-1 text-sm text-zinc-500">Serviço, data e horário para preencher seus dados.</p>
                    </div>
                  )}
                  </TabPanel>
              </TabPanels>
            </TabGroup>
          )}
        </div>
      </div>
    </div>
  );
}
