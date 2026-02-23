import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-4">
      <h1 className="text-4xl font-bold text-zinc-900 sm:text-5xl">BarberCMZ</h1>
      <p className="text-center text-lg text-zinc-600">
        Sistema de agendamento para barbearias
      </p>
      <p className="text-center text-sm text-amber-700">
        30 dias grátis para testar
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={ROUTES.PLANOS}
          className="rounded-xl border-2 border-amber-500 bg-white px-6 py-3 font-medium text-amber-600 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          Ver planos
        </Link>
        <Link
          href={ROUTES.LOGIN}
          className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          Entrar
        </Link>
        <Link
          href={ROUTES.DASHBOARD}
          className="rounded-xl bg-zinc-200 px-6 py-3 font-medium text-zinc-700 hover:bg-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
