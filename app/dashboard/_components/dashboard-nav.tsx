'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDaysIcon,
  HomeIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import {
  CalendarDaysIcon as CalendarDaysIconSolid,
  HomeIcon as HomeIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
} from '@heroicons/react/24/solid';

const navItems = [
  { href: '/dashboard', label: 'Início', icon: HomeIcon, iconActive: HomeIconSolid },
  { href: '/dashboard/agenda', label: 'Agenda', icon: CalendarDaysIcon, iconActive: CalendarDaysIconSolid },
  { href: '/dashboard/menu', label: 'Menu', icon: Squares2X2Icon, iconActive: Squares2X2IconSolid },
] as const;

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map(({ href, label, icon: Icon, iconActive: IconActive }) => {
          const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-3 px-2 text-center transition ${
                isActive
                  ? 'text-amber-600'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive ? (
                <IconActive className="h-6 w-6 shrink-0" aria-hidden />
              ) : (
                <Icon className="h-6 w-6 shrink-0" aria-hidden />
              )}
              <span className="text-xs font-medium truncate w-full">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
