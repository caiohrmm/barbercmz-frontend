'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react';
import { ChevronLeftIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/providers/auth-provider';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard/agenda': 'Agenda',
  '/dashboard/services': 'Serviços',
  '/dashboard/clients': 'Clientes',
  '/dashboard/billing': 'Faturamento',
  '/dashboard/settings': 'Configurações',
  '/dashboard/menu': 'Menu',
};

function getPageTitle(pathname: string): string {
  if (pathname === '/dashboard') return 'Dashboard';
  for (const [path, t] of Object.entries(PAGE_TITLES)) {
    if (pathname === path || pathname.startsWith(path + '/')) return t;
  }
  return 'Dashboard';
}

interface DashboardHeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export function DashboardHeader({ title, showBack, backHref = '/dashboard' }: DashboardHeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isHome = pathname === '/dashboard';
  const resolvedTitle = title ?? getPageTitle(pathname);
  const showBackButton = showBack ?? !isHome;

  const nameChar = user?.name?.trim().charAt(0);
  const emailChar = user?.email?.trim().charAt(0);
  const initial = (nameChar || emailChar || '?').toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {showBackButton && !isHome ? (
            <>
              <Link
                href={backHref}
                className="flex shrink-0 items-center gap-1 rounded-lg py-2 pr-2 -ml-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                aria-label="Voltar"
              >
                <ChevronLeftIcon className="h-6 w-6" aria-hidden />
              </Link>
              <span className="truncate text-lg font-semibold text-zinc-900">{resolvedTitle}</span>
            </>
          ) : (
            <span className="text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
              {!isHome ? 'BarberCMZ' : ''}
            </span>
          )}
        </div>

        <Menu as="div" className="relative shrink-0">
          <MenuButton
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-500 text-lg font-semibold leading-none text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            aria-label="Abrir menu da conta"
          >
            <span className="flex h-full w-full select-none items-center justify-center text-[1rem]" aria-hidden>
              {initial}
            </span>
          </MenuButton>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition duration-75 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <MenuItems
              anchor="bottom end"
              className="z-50 mt-2 w-56 origin-top-right rounded-2xl border border-zinc-200 bg-white p-1 shadow-lg focus:outline-none"
            >
              <div className="border-b border-zinc-100 px-3 py-2">
                <p className="truncate text-sm font-medium text-zinc-900">{user?.name}</p>
                <p className="truncate text-xs text-zinc-500">{user?.email}</p>
                <p className="mt-0.5 text-xs text-amber-600 capitalize">
                  {user?.role === 'owner' ? 'Proprietário' : 'Barbeiro'}
                </p>
              </div>
              <Link href="/dashboard/settings">
                <MenuItem>
                  {({ focus }) => (
                    <span
                      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ${
                        focus ? 'bg-amber-50 text-amber-900' : 'text-zinc-700'
                      }`}
                    >
                      <Cog6ToothIcon className="h-5 w-5" aria-hidden />
                      Configurações
                    </span>
                  )}
                </MenuItem>
              </Link>
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={logout}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm ${
                      focus ? 'bg-red-50 text-red-700' : 'text-zinc-700'
                    }`}
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden />
                    Sair
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Transition>
        </Menu>
      </div>
    </header>
  );
}
