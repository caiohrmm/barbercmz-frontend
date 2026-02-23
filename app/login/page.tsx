'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Transition } from '@headlessui/react';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { loginSchema, type LoginInput } from '@/lib/validators';
import { login } from '@/lib/auth';
import { useAuth } from '@/lib/providers/auth-provider';
import { ROUTES } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data);
      refreshUser();
      router.push(ROUTES.DASHBOARD);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : null;
      setError(message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-zinc-950">
      {/* Safe area + padding for mobile */}
      <main
        className="flex flex-1 flex-col justify-center px-5 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] sm:px-8"
        role="main"
        aria-label="Página de login"
      >
        <div className="mx-auto w-full max-w-[22rem] sm:max-w-md">
          {/* Header */}
          <header className="mb-10 flex flex-col items-center text-center">
            <Image
              src="/logo.png"
              alt="BarberCMZ"
              width={200}
              height={100}
              priority
              className="h-20w-auto object-contain"
            />
            <p className="mt-4 text-sm text-zinc-400">
              Entre na sua conta para continuar
            </p>
          </header>

          {/* Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl backdrop-blur sm:p-8">
            {/* Error alert - Headless UI Transition */}
            <Transition
              show={!!error}
              enter="transition duration-200 ease-out"
              enterFrom="opacity-0 -translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="transition duration-150 ease-in"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-2"
            >
              <div
                className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            </Transition>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Email
                </label>
                <div className="relative">
                  <EnvelopeIcon
                    className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
                    aria-hidden
                  />
                  <input
                    {...register('email')}
                    type="email"
                    id="login-email"
                    autoComplete="email"
                    autoCapitalize="none"
                    inputMode="email"
                    placeholder="seu@email.com"
                    disabled={isLoading}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'login-email-error' : undefined}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 py-3.5 pl-11 pr-4 text-white placeholder-zinc-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 [min-height:2.75rem]"
                  />
                </div>
                {errors.email && (
                  <p
                    id="login-email-error"
                    className="text-sm text-amber-400"
                    role="alert"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Senha
                </label>
                <div className="relative">
                  <LockClosedIcon
                    className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
                    aria-hidden
                  />
                  <input
                    {...register('password')}
                    type="password"
                    id="login-password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? 'login-password-error' : undefined
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 py-3.5 pl-11 pr-4 text-white placeholder-zinc-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 [min-height:2.75rem]"
                  />
                </div>
                {errors.password && (
                  <p
                    id="login-password-error"
                    className="text-sm text-amber-400"
                    role="alert"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 px-4 font-medium text-zinc-950 shadow-lg shadow-amber-500/25 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:pointer-events-none disabled:opacity-70 [min-height:2.75rem]"
                aria-busy={isLoading}
                aria-live="polite"
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon
                      className="h-5 w-5 animate-spin"
                      aria-hidden
                    />
                    <span>Entrando...</span>
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          </div>

          {/* Footer link */}
          <p className="mt-8 text-center text-sm text-zinc-500">
            <a
              href="/"
              className="text-zinc-400 underline decoration-zinc-600 underline-offset-2 transition hover:text-zinc-300 hover:decoration-zinc-500"
            >
              Voltar ao início
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

