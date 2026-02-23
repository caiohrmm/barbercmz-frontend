'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Transition } from '@headlessui/react';
import {
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
import type { AvailableSlot, PublicBarber } from '@/lib/public-api';
import { getPublicBarbers, getAvailableSlots, createAppointment } from '@/lib/public-api';
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
  const [barbers, setBarbers] = useState<PublicBarber[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<PublicBarber | null>(null);
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

  const hasBarberStep = barbers.length > 1;

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
    let cancelled = false;
    getPublicBarbers(barbershop.id)
      .then((res) => {
        if (!cancelled) {
          setBarbers(res.barbers ?? []);
          if (res.barbers?.length === 1) setSelectedBarber(res.barbers[0]);
        }
      })
      .catch(() => {
        if (!cancelled) setBarbers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [barbershop.id]);

  useEffect(() => {
    if (!selectedService || !selectedDate) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }
    if (hasBarberStep && !selectedBarber) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setSelectedSlot(null);
    setSlotsError(false);
    getAvailableSlots(
      barbershop.id,
      selectedDate,
      selectedService.id,
      selectedBarber?.id
    )
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
  }, [barbershop.id, selectedService?.id, selectedDate, selectedBarber?.id, hasBarberStep]);

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
    setSelectedBarber(barbers.length === 1 ? barbers[0] : null);
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

  const stepComplete = hasBarberStep
    ? ([!!selectedService, !!selectedBarber, !!selectedDate, !!selectedSlot, false] as const)
    : ([!!selectedService, !!selectedDate, !!selectedSlot, false] as const);
  const canGoToStep = (index: number) => {
    for (let i = 0; i < index; i++) if (!stepComplete[i]) return false;
    return true;
  };

  const steps = hasBarberStep
    ? [
        { key: 0, label: 'Serviço' },
        { key: 1, label: 'Barbeiro' },
        { key: 2, label: 'Data' },
        { key: 3, label: 'Horário' },
        { key: 4, label: 'Dados' },
      ]
    : [
        { key: 0, label: 'Serviço' },
        { key: 1, label: 'Data' },
        { key: 2, label: 'Horário' },
        { key: 3, label: 'Dados' },
      ];

  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        <div className="mx-auto max-w-lg">
          {/* Header: nome centralizado */}
          <header className="flex h-14 items-center justify-center border-b border-zinc-100 py-3 sm:h-16">
            <h1 className="min-w-0 truncate text-center text-lg font-semibold text-zinc-900">
              {barbershop.name}
            </h1>
          </header>

          {/* Logo + indicador de etapas */}
          <div className="flex items-start gap-4 border-b border-zinc-100 py-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-amber-100 ring-2 ring-amber-200">
              {barbershop.logoUrl ? (
                <Image
                  src={barbershop.logoUrl}
                  alt=""
                  width={56}
                  height={56}
                  className="object-cover size-full"
                />
              ) : (
                <Image
                  src="/logo.svg"
                  alt=""
                  width={56}
                  height={56}
                  className="object-contain p-2"
                />
              )}
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-center justify-between gap-0">
                {steps.map(({ key }, i) => {
                  const isCurrent = selectedTabIndex === key;
                  const isComplete = stepComplete[key];
                  const canGo = canGoToStep(key);
                  return (
                    <div key={key} className="flex flex-1 items-center">
                      <button
                        type="button"
                        onClick={() => canGo && setSelectedTabIndex(key)}
                        disabled={!canGo}
                        className="flex flex-col items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 rounded"
                        aria-current={isCurrent ? 'step' : undefined}
                        aria-label={`Etapa ${key + 1}: ${steps[key].label}`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition ${
                            isComplete
                              ? 'border-amber-500 bg-amber-500 text-white'
                              : isCurrent
                                ? 'border-amber-500 bg-amber-500 text-white'
                                : 'border-zinc-200 bg-white'
                          }`}
                        >
                          {isComplete ? (
                            <CheckIcon className="h-4 w-4" aria-hidden />
                          ) : null}
                        </span>
                        <span
                          className={`text-[10px] font-medium ${
                            isCurrent || isComplete ? 'text-amber-600' : 'text-zinc-400'
                          }`}
                        >
                          {steps[key].label}
                        </span>
                      </button>
                      {i < steps.length - 1 && (
                        <div
                          className={`mx-0.5 h-0.5 min-w-[6px] flex-1 rounded ${
                            stepComplete[key] ? 'bg-amber-300' : 'bg-zinc-200'
                          }`}
                          aria-hidden
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

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
            <div className="py-4">
              {/* Etapa 1: Serviço */}
              {selectedTabIndex === 0 && (
                <>
                  <section aria-labelledby="service-heading">
                    <h2 id="service-heading" className="mb-3 text-base font-medium text-zinc-800">
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
                <ul className="grid gap-3" role="list">
                  {services.map((service) => {
                    const isSelected = selectedService?.id === service.id;
                    return (
                      <li key={service.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedService(service)}
                          aria-pressed={isSelected}
                          aria-label={`${service.name}, ${formatDuration(service.duration)}, ${formatPrice(service.price)}`}
                          className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                            isSelected
                              ? 'border-amber-400 bg-amber-50/80'
                              : 'border-zinc-200 bg-white hover:border-amber-200 hover:bg-zinc-50'
                          }`}
                        >
                          <span
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                              isSelected ? 'bg-amber-200/80 text-amber-800' : 'bg-zinc-100 text-zinc-500'
                            }`}
                          >
                            <ScissorsIcon className="h-6 w-6" aria-hidden />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={`font-medium ${isSelected ? 'text-zinc-900' : 'text-zinc-800'}`}>
                              {service.name}
                            </p>
                            <p className="mt-0.5 text-sm text-zinc-500">{formatDuration(service.duration)}</p>
                          </div>
                          <span
                            className={`shrink-0 font-semibold tabular-nums ${
                              isSelected ? 'text-amber-600' : 'text-zinc-600'
                            }`}
                          >
                            {formatPrice(service.price)}
                          </span>
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                              isSelected ? 'bg-amber-500 text-white' : 'border-2 border-zinc-300'
                            }`}
                          >
                            {isSelected && <CheckIcon className="h-4 w-4" aria-hidden />}
                          </span>
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
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-500 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
              >
                Continuar
              </button>
            )}
                </>
              )}

              {/* Etapa Barbeiro (só quando há mais de um barbeiro) */}
              {hasBarberStep && selectedTabIndex === 1 && (
                <>
                  <section aria-labelledby="barber-heading">
                    <h2 id="barber-heading" className="mb-3 text-base font-medium text-zinc-800">
                      2. Barbeiro
                    </h2>
                    <p className="mb-3 text-sm text-zinc-500">
                      Escolha com quem deseja agendar.
                    </p>
                    <ul className="grid gap-3" role="list">
                      {barbers.map((barber) => {
                        const isSelected = selectedBarber?.id === barber.id;
                        return (
                          <li key={barber.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBarber(barber);
                                setSelectedDate(null);
                                setSelectedSlot(null);
                                setSlots([]);
                              }}
                              aria-pressed={isSelected}
                              aria-label={`Barbeiro ${barber.name}`}
                              className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                                isSelected
                                  ? 'border-amber-400 bg-amber-50/80'
                                  : 'border-zinc-200 bg-white hover:border-amber-200 hover:bg-zinc-50'
                              }`}
                            >
                              <span
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                                  isSelected ? 'bg-amber-200/80 text-amber-800' : 'bg-zinc-100 text-zinc-500'
                                }`}
                              >
                                <UserCircleIcon className="h-6 w-6" aria-hidden />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className={`font-medium ${isSelected ? 'text-zinc-900' : 'text-zinc-800'}`}>
                                  {barber.name}
                                </p>
                              </div>
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                                  isSelected ? 'bg-amber-500 text-white' : 'border-2 border-zinc-300'
                                }`}
                              >
                                {isSelected && <CheckIcon className="h-4 w-4" aria-hidden />}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                  {selectedBarber && (
                    <button
                      type="button"
                      onClick={() => setSelectedTabIndex(2)}
                      className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-500 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                    >
                      Continuar
                    </button>
                  )}
                </>
              )}

              {/* Etapa Data */}
              {((hasBarberStep && selectedTabIndex === 2) || (!hasBarberStep && selectedTabIndex === 1)) && (
                <>
                  <section aria-labelledby="date-heading">
                    <h2 id="date-heading" className="mb-3 text-base font-medium text-zinc-800">
                      {hasBarberStep ? '3. Data' : '2. Data'}
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
                onClick={() => setSelectedTabIndex(hasBarberStep ? 3 : 2)}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-500 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
              >
                Continuar
              </button>
            )}
                </>
              )}

              {/* Etapa Horário */}
              {((hasBarberStep && selectedTabIndex === 3) || (!hasBarberStep && selectedTabIndex === 2)) && (
                <>
                  <section aria-labelledby="time-heading">
                    <h2 id="time-heading" className="mb-3 text-base font-medium text-zinc-800">
                      {hasBarberStep ? '4. Horário' : '3. Horário'}
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
                onClick={() => setSelectedTabIndex(hasBarberStep ? 4 : 3)}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-500 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
              >
                Continuar
              </button>
            )}
                </>
              )}

              {/* Etapa Dados */}
              {((hasBarberStep && selectedTabIndex === 4) || (!hasBarberStep && selectedTabIndex === 3)) && (
                <>
                  {selectedService && selectedDate && selectedSlot ? (
              <section aria-labelledby="customer-heading">
                <h2 id="customer-heading" className="mb-3 text-base font-medium text-zinc-800">
                  {hasBarberStep ? '5. Dados' : '4. Dados'}
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
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 px-4 font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-500 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-70"
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
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
