import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:pt-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl">
          Encha sua agenda e{' '}
          <span className="text-amber-400">reduza faltas</span>
        </h1>
        <p className="mt-4 text-lg text-zinc-400 sm:text-xl">
          Sistema de agendamento feito para barbearias. Seus clientes agendam pelo celular e você controla tudo em um só lugar.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            href={ROUTES.CRIAR_BARBEARIA}
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-4 text-base font-semibold text-zinc-950 shadow-lg transition hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] active:scale-[0.98]"
          >
            Criar minha barbearia — grátis
          </Link>
          <a
            href="#como-funciona"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-600 bg-transparent px-6 py-4 text-base font-medium text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          >
            Ver como funciona
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 gap-y-2 text-sm text-zinc-500">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/50 px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
            30 dias grátis
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/50 px-3.5 py-1.5">
            Sem cartão de crédito
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/50 px-3.5 py-1.5">
            Cancele quando quiser
          </span>
        </div>
      </div>
    </section>
  );
}
