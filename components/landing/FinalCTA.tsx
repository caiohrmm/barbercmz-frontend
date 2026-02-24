import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export function FinalCTA() {
  return (
    <section className="border-t border-zinc-800/80 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-700 bg-gradient-to-br from-zinc-800 to-zinc-900 p-8 text-center shadow-xl sm:p-10">
        <h2 className="text-2xl font-bold text-zinc-100 sm:text-3xl">
          Pronto para encher sua agenda?
        </h2>
        <p className="mt-3 text-zinc-400">
          Crie sua barbearia em 2 minutos. Sem cartão. Cancele quando quiser.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            href={ROUTES.CRIAR_BARBEARIA}
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-4 text-base font-semibold text-zinc-950 shadow-lg transition hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 active:scale-[0.98]"
          >
            Começar 30 dias grátis
          </Link>
          <Link
            href={ROUTES.PLANOS}
            className="inline-flex items-center justify-center rounded-xl border border-zinc-600 px-6 py-4 text-base font-medium text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            Ver todos os planos
          </Link>
        </div>
        <p className="mt-6 text-sm text-zinc-500">
          ✓ Sem cartão  ✓ Suporte em português  ✓ Dados no Brasil
        </p>
      </div>
    </section>
  );
}
