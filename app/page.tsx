import Link from 'next/link';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon as CheckSolid } from '@heroicons/react/24/solid';
import { ROUTES } from '@/lib/constants';

function ScissorsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 7.5 7.5 0 0114.304 3M7.848 8.25L5.25 10.5m2.598-2.25l2.598 2.25M5.25 10.5l-2.598 2.25m0 0l2.598 2.25M5.25 10.5h12m-12 0l2.598-2.25M17.25 10.5l-2.598 2.25m2.598-2.25l2.598 2.25"
      />
    </svg>
  );
}

const benefits = [
  'Agenda automática',
  'Fácil para o cliente agendar',
  'Mais faturamento',
];

const features = [
  {
    icon: CalendarDaysIcon,
    title: 'Agenda inteligente',
    description: 'Nunca mais perca horários',
  },
  {
    icon: UserGroupIcon,
    title: 'Controle de clientes',
    description: 'Histórico completo de cada cliente',
  },
  {
    icon: ExclamationTriangleIcon,
    title: 'Menos faltas',
    description: 'Controle e bloqueio automático',
  },
  {
    icon: ChartBarIcon,
    title: 'Cresça sua barbearia',
    description: 'Mais organização = mais dinheiro',
  },
];

const steps = [
  'Crie sua barbearia',
  'Configure horários e serviços',
  'Compartilhe seu link de agendamento',
  'Receba clientes sem esforço',
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Hero */}
      <section className="px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            BarberCMZ
          </h1>
          <p className="mt-3 text-lg text-zinc-600 sm:text-xl">
            Organize sua barbearia e nunca mais perca{' '}
            <span className="inline-flex items-center gap-1">
              clientes
              <ScissorsIcon className="h-4 w-4 text-amber-500 sm:h-5 sm:w-5" />
            </span>
          </p>
          <ul className="mt-6 space-y-2 text-left sm:mx-auto sm:inline-block">
            {benefits.map((text) => (
              <li key={text} className="flex items-center gap-2 text-zinc-700">
                <CheckSolid className="h-5 w-5 shrink-0 text-amber-500" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href={ROUTES.PLANOS}
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              Começar grátis
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 py-3.5 font-medium text-zinc-700 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
            >
              Ver como funciona
            </a>
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            Sem cartão • 30 dias grátis
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-200 bg-zinc-50/60 px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-5 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/80"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">{title}</h3>
                    <p className="mt-1 text-sm text-zinc-600">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="border-t border-zinc-200 px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl bg-zinc-50 p-6 ring-1 ring-zinc-200/80 sm:p-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-amber-200">
                <div className="flex h-full w-full items-center justify-center text-2xl text-amber-600">
                  ✓
                </div>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-medium text-zinc-900">
                  +50 barbeiros já usam o BarberCMZ
                </p>
                <blockquote className="mt-2 text-zinc-600">
                  &ldquo;Minha agenda ficou cheia depois que comecei a usar&rdquo;
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="como-funciona"
        className="border-t border-zinc-200 bg-zinc-50/60 px-4 py-14 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-2xl">
          <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">
            Veja como funciona
          </h2>
          <ol className="mt-6 space-y-4">
            {steps.map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <span className="text-zinc-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="border-t border-zinc-200 px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-zinc-500">BarberCMZ — sua barbearia organizada</p>
          <div className="flex gap-4">
            <Link
              href={ROUTES.LOGIN}
              className="text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              Entrar
            </Link>
            <Link
              href={ROUTES.PLANOS}
              className="text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              Planos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
