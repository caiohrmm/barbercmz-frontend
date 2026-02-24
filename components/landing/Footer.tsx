import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-sm text-zinc-500">
            BarberCMZ — sua barbearia organizada
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-6" aria-label="Links do rodapé">
            <Link
              href={ROUTES.LOGIN}
              className="text-sm font-medium text-zinc-400 transition hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded"
            >
              Entrar
            </Link>
            <Link
              href={ROUTES.PLANOS}
              className="text-sm font-medium text-zinc-400 transition hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded"
            >
              Planos
            </Link>
            <a
              href="#faq"
              className="text-sm font-medium text-zinc-400 transition hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded"
            >
              FAQ
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
