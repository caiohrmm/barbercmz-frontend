'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { ROUTES } from '@/lib/constants';

export function Navbar() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: '#beneficios', label: 'Benefícios' },
    { href: '#como-funciona', label: 'Como funciona' },
    { href: '#planos', label: 'Planos' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6" aria-label="Navegação principal">
        <Link
          href={ROUTES.HOME}
          className="text-xl font-bold tracking-tight text-zinc-100 transition hover:text-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          BarberCMZ
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-zinc-400 transition hover:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded"
            >
              {label}
            </a>
          ))}
          <Link
            href={ROUTES.LOGIN}
            className="text-sm font-medium text-zinc-400 transition hover:text-zinc-100"
          >
            Entrar
          </Link>
          <Link
            href={ROUTES.PLANOS}
            className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg transition hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] active:scale-[0.98]"
          >
            Começar grátis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`border-t border-zinc-800 bg-zinc-900/98 px-4 py-4 md:hidden ${open ? 'block' : 'hidden'}`}
        role="region"
        aria-label="Menu mobile"
      >
        <ul className="space-y-1">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              >
                {label}
              </a>
            </li>
          ))}
          <li className="border-t border-zinc-800 pt-2">
            <Link
              href={ROUTES.LOGIN}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Entrar
            </Link>
          </li>
          <li>
            <Link
              href={ROUTES.PLANOS}
              onClick={() => setOpen(false)}
              className="mt-2 flex justify-center rounded-xl bg-amber-500 px-4 py-3.5 font-semibold text-zinc-950"
            >
              Começar grátis
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
