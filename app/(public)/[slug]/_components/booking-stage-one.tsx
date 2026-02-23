'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import type { Barbershop, Service } from '@/types';
import type { AvailableSlot } from '@/lib/public-api';
import { getAvailableSlots } from '@/lib/public-api';
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
    getAvailableSlots(barbershop.id, selectedDate, selectedService.id)
      .then((res) => {
        if (!cancelled) setSlots(res.slots);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [barbershop.id, selectedService?.id, selectedDate]);

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
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-zinc-500">
                  Nenhum serviço disponível.
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
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-10">
                  <div
                    className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"
                    aria-hidden
                  />
                  <span className="text-sm text-zinc-500">Buscando horários...</span>
                </div>
              ) : slots.length === 0 ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500">
                  Nenhum horário disponível neste dia. Escolha outra data.
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

            {/* Resumo (para etapa 3) */}
            {selectedService && selectedDate && selectedSlot && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                <p className="text-sm font-medium text-amber-900">Resumo</p>
                <p className="mt-1 text-sm text-zinc-700">
                  {selectedService.name} · {format(new Date(selectedDate + 'T12:00:00'), "EEEE, d 'de' MMMM", { locale: ptBR })} às {selectedSlot.time} com {selectedSlot.barberName}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  Na próxima etapa você informa nome e telefone para confirmar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
