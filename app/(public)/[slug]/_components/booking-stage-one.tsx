'use client';

import Image from 'next/image';
import { BanknotesIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { Barbershop, Service } from '@/types';

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

interface ServiceCardProps {
  service: Service;
}

function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-amber-200 hover:shadow-md">
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-zinc-900">{service.name}</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="h-4 w-4" aria-hidden />
            {formatDuration(service.duration)}
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-amber-600">
            <BanknotesIcon className="h-4 w-4" aria-hidden />
            {formatPrice(service.price)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface BookingStageOneProps {
  barbershop: Barbershop;
  services: Service[];
}

export function BookingStageOne({ barbershop, services }: BookingStageOneProps) {
  return (
    <div className="min-h-[100dvh] bg-zinc-50">
      {/* Safe area + padding */}
      <div className="px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        <div className="mx-auto max-w-lg">
          {/* Header: barbearia */}
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
                  Escolha um serviço para agendar
                </p>
              </div>
            </div>
          </header>

          {/* Lista de serviços */}
          <section
            className="py-6"
            aria-labelledby="services-heading"
          >
            <h2 id="services-heading" className="sr-only">
              Serviços disponíveis
            </h2>
            {services.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
                <p>Nenhum serviço disponível no momento.</p>
              </div>
            ) : (
              <ul className="space-y-3" role="list">
                {services.map((service) => (
                  <li key={service.id}>
                    <ServiceCard service={service} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
