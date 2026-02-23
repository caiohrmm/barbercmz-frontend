'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import {
  BanknotesIcon,
  ClockIcon,
  ChevronDownIcon,
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
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingCustomerInput>({
    resolver: zodResolver(bookingCustomerSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const dateOptions = Array.from({ length: NEXT_DAYS }, (_, i) => {
    const d = addDays(new Date(), i);
    return { date: d, value: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE, d MMM', { locale: ptBR }) };
  });

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
    reset();
  };

  useEffect(() => {
    if (submitSuccess && successButtonRef.current) {
      successButtonRef.current.focus();
    }
  }, [submitSuccess]);

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
                  Escolha serviço, data e horário
                </p>
              </div>
            </div>
          </header>

          <div className="space-y-6 py-6">
            {/* 1. Serviço */}
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
                <div className="relative">
                  <Listbox value={selectedService} onChange={setSelectedService}>
                    <ListboxButton className="relative w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 [&[data-headlessui-state]:border-amber-500]">
                    <span className="block truncate">
                      {selectedService
                        ? `${selectedService.name} · ${formatDuration(selectedService.duration)} · ${formatPrice(selectedService.price)}`
                        : 'Selecione um serviço'}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronDownIcon className="h-5 w-5 text-zinc-400" aria-hidden />
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
                    <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-[calc(100vw-2rem)] max-w-[calc(theme(maxWidth.lg)-2rem)] overflow-auto rounded-2xl border border-zinc-200 bg-white py-1 shadow-lg focus:outline-none">
                      {services.map((service) => (
                        <ListboxOption
                          key={service.id}
                          value={service}
                          className="group relative cursor-pointer select-none px-4 py-3 data-[selected]:bg-amber-50 data-[focus]:bg-zinc-50"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="font-medium text-zinc-900 group-data-[selected]:text-amber-800">
                                {service.name}
                              </p>
                              <p className="text-sm text-zinc-500">
                                {formatDuration(service.duration)} · {formatPrice(service.price)}
                              </p>
                            </div>
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 opacity-0 group-data-[selected]:opacity-100">
                              <CheckIcon className="h-4 w-4" aria-hidden />
                            </span>
                          </div>
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </Transition>
                </Listbox>
                </div>
              )}
            </section>

            {/* 2. Data */}
            <section aria-labelledby="date-heading">
              <h2 id="date-heading" className="mb-3 text-sm font-medium text-zinc-700">
                2. Data
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedDate(opt.value)}
                    aria-pressed={selectedDate === opt.value}
                    aria-label={isToday(opt.date) ? `Hoje, ${opt.label}` : opt.label}
                    className={`min-w-[7rem] shrink-0 rounded-xl border px-3 py-3 text-center text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                      selectedDate === opt.value
                        ? 'border-amber-500 bg-amber-500 text-zinc-950'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-amber-200'
                    }`}
                  >
                    <span className="block capitalize">{opt.label}</span>
                    {isToday(opt.date) && (
                      <span className="mt-0.5 block text-xs opacity-80">Hoje</span>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* 3. Horário */}
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
                <div className="relative">
                  <Listbox value={selectedSlot} onChange={setSelectedSlot}>
                    <ListboxButton className="relative w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 [&[data-headlessui-state]:border-amber-500]">
                    <span className="flex items-center gap-2">
                      <ClockIcon className="h-5 w-5 text-zinc-400" aria-hidden />
                      {selectedSlot
                        ? `${selectedSlot.time} · ${selectedSlot.barberName}`
                        : 'Selecione um horário'}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronDownIcon className="h-5 w-5 text-zinc-400" aria-hidden />
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
                    <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-[calc(100vw-2rem)] max-w-[calc(theme(maxWidth.lg)-2rem)] overflow-auto rounded-2xl border border-zinc-200 bg-white py-1 shadow-lg focus:outline-none">
                      {slots.map((slot) => (
                        <ListboxOption
                          key={`${slot.time}-${slot.barberId}`}
                          value={slot}
                          className="group relative cursor-pointer select-none px-4 py-3 data-[selected]:bg-amber-50 data-[focus]:bg-zinc-50"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-zinc-900 group-data-[selected]:text-amber-800">
                              {slot.time}
                            </span>
                            <span className="text-sm text-zinc-500">{slot.barberName}</span>
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 opacity-0 group-data-[selected]:opacity-100">
                              <CheckIcon className="h-4 w-4" aria-hidden />
                            </span>
                          </div>
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </Transition>
                </Listbox>
                </div>
              )}
            </section>

            {/* Sucesso */}
            {submitSuccess && lastBookingSummary && (
              <Transition
                show={submitSuccess}
                enter="transition duration-200 ease-out"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
              >
                <div
                  className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center shadow-sm"
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
            )}

            {/* 4. Seus dados + Confirmar (só quando serviço, data e horário escolhidos e não sucesso) */}
            {selectedService && selectedDate && selectedSlot && !submitSuccess && (
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
                        <input
                          {...register('customerPhone')}
                          type="tel"
                          id="booking-phone"
                          autoComplete="tel"
                          placeholder="(11) 99999-9999"
                          disabled={isSubmitting}
                          className="w-full rounded-xl border border-zinc-300 py-3 pl-11 pr-4 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                        />
                      </div>
                      {errors.customerPhone && (
                        <p className="mt-1 text-sm text-red-600" role="alert">
                          {errors.customerPhone.message}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-zinc-500">
                        Com DDD. Ex: (11) 99999-9999 ou +5511999999999
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
