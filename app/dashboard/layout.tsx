'use client';

import { useAuth } from '@/lib/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { DashboardHeader } from './_components/dashboard-header';
import { DashboardNav } from './_components/dashboard-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" aria-hidden />
        <p className="mt-3 text-sm text-zinc-500">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50">
        <p className="text-zinc-600">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <DashboardHeader />
      <main className="mx-auto min-h-[calc(100dvh-theme(spacing.14)-env(safe-area-inset-top))] max-w-lg sm:min-h-[calc(100dvh-theme(spacing.16))] pb-20 md:pb-8">
        {children}
      </main>
      <DashboardNav />
    </div>
  );
}
