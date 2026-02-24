'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  BuildingStorefrontIcon,
  UserCircleIcon,
  Squares2X2Icon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { getPlans } from '@/lib/plans';
import { createBarbershop } from '@/lib/barbershop';
import { ROUTES } from '@/lib/constants';
import {
  createBarbershopStep1Schema,
  createBarbershopStep2Schema,
  type CreateBarbershopStep1Input,
  type CreateBarbershopStep2Input,
} from '@/lib/validators';
import type { Plan } from '@/types';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const STEPS = [
  { key: 1, label: 'Dados da barbearia', icon: BuildingStorefrontIcon },
  { key: 2, label: 'Dono', icon: UserCircleIcon },
  { key: 3, label: 'Plano', icon: Squares2X2Icon },
  { key: 4, label: 'Confirmar', icon: ClipboardDocumentCheckIcon },
] as const;

export default function CriarBarbeariaPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [planId, setPlanId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [step1Data, setStep1Data] = useState<CreateBarbershopStep1Input>({ name: '', slug: '' });
  const [step2Data, setStep2Data] = useState<CreateBarbershopStep2Input | null>(null);

  const form1 = useForm<CreateBarbershopStep1Input>({
    resolver: zodResolver(createBarbershopStep1Schema),
    defaultValues: step1Data,
  });
  const form2 = useForm<CreateBarbershopStep2Input>({
    resolver: zodResolver(createBarbershopStep2Schema),
    defaultValues: {
      ownerName: '',
      ownerEmail: '',
      ownerPassword: '',
      ownerPasswordConfirm: '',
    },
  });

  const { data: plans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ['plans', 'public'],
    queryFn: getPlans,
  });

  const selectedPlan = planId ? plans.find((p) => p.id === planId) : null;

  const onStep1Submit = (data: CreateBarbershopStep1Input) => {
    setStep1Data(data);
    setSubmitError(null);
    setStep(2);
  };

  const onStep2Submit = (data: CreateBarbershopStep2Input) => {
    setStep2Data(data);
    setSubmitError(null);
    setStep(3);
  };

  const canGoStep4 = planId != null;
  const onStep3Next = () => {
    if (!canGoStep4) return;
    setSubmitError(null);
    setStep(4);
  };

  const onConfirm = async () => {
    if (!step2Data || !planId) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const slugValue = step1Data.slug?.trim();
      await createBarbershop({
        name: step1Data.name.trim(),
        slug: slugValue ? slugValue : undefined,
        planId,
        ownerName: step2Data.ownerName.trim(),
        ownerEmail: step2Data.ownerEmail.trim().toLowerCase(),
        ownerPassword: step2Data.ownerPassword,
      });
      router.push(ROUTES.LOGIN + '?criado=1');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível criar. Tente novamente.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link
            href={ROUTES.HOME}
            className="text-lg font-semibold text-zinc-900 hover:text-amber-600"
          >
            BarberCMZ
          </Link>
          <div className="flex gap-3">
            <Link
              href={ROUTES.PLANOS}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              Planos
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
          Criar minha barbearia
        </h1>
        <p className="mt-1 text-zinc-600">
          Preencha os passos abaixo. Você ganha 30 dias grátis em qualquer plano.
        </p>

        {/* Step indicators */}
        <nav aria-label="Etapas" className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
          {STEPS.map(({ key, label, icon: Icon }, i) => {
            const isCurrent = step === key;
            const isPast = step > key;
            return (
              <div key={key} className="flex flex-shrink-0 items-center gap-1.5">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium ${
                    isCurrent
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : isPast
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-zinc-300 bg-white text-zinc-500'
                  }`}
                >
                  {isPast ? <CheckCircleIcon className="h-5 w-5" /> : key}
                </span>
                <span className={`hidden text-sm sm:inline ${isCurrent ? 'font-medium text-zinc-900' : 'text-zinc-500'}`}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-zinc-300" aria-hidden />
                )}
              </div>
            );
          })}
        </nav>

        {submitError && (
          <div
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {submitError}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Dados da barbearia</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Nome que aparecerá para os clientes. O link de agendamento usará um “slug” (você pode personalizar ou deixar em branco).
            </p>
            <form onSubmit={form1.handleSubmit(onStep1Submit)} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
                  Nome da barbearia *
                </label>
                <input
                  {...form1.register('name')}
                  id="name"
                  type="text"
                  autoComplete="organization"
                  placeholder="Ex: Barbearia do João"
                  className="mt-1 w-full rounded-xl border border-zinc-300 py-3 px-4 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                {form1.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {form1.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-zinc-700">
                  Slug (opcional)
                </label>
                <input
                  {...form1.register('slug')}
                  id="slug"
                  type="text"
                  placeholder="Ex: barbearia-do-joao (deixe em branco para gerar)"
                  className="mt-1 w-full rounded-xl border border-zinc-300 py-3 px-4 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 lowercase"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Apenas letras minúsculas, números e hífens. Seu link: barbercmz.com/[slug]
                </p>
                {form1.formState.errors.slug && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {form1.formState.errors.slug.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 font-semibold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                Próximo
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </form>
          </section>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Dados do dono</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Este será o usuário administrador da barbearia (login no painel).
            </p>
            <form onSubmit={form2.handleSubmit(onStep2Submit)} className="mt-6 space-y-4">
              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium text-zinc-700">
                  Nome completo *
                </label>
                <input
                  {...form2.register('ownerName')}
                  id="ownerName"
                  type="text"
                  autoComplete="name"
                  placeholder="Seu nome"
                  className="mt-1 w-full rounded-xl border border-zinc-300 py-3 px-4 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                {form2.formState.errors.ownerName && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {form2.formState.errors.ownerName.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="ownerEmail" className="block text-sm font-medium text-zinc-700">
                  Email *
                </label>
                <input
                  {...form2.register('ownerEmail')}
                  id="ownerEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className="mt-1 w-full rounded-xl border border-zinc-300 py-3 px-4 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                {form2.formState.errors.ownerEmail && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {form2.formState.errors.ownerEmail.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="ownerPassword" className="block text-sm font-medium text-zinc-700">
                  Senha *
                </label>
                <input
                  {...form2.register('ownerPassword')}
                  id="ownerPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  className="mt-1 w-full rounded-xl border border-zinc-300 py-3 px-4 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                {form2.formState.errors.ownerPassword && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {form2.formState.errors.ownerPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="ownerPasswordConfirm" className="block text-sm font-medium text-zinc-700">
                  Confirmar senha *
                </label>
                <input
                  {...form2.register('ownerPasswordConfirm')}
                  id="ownerPasswordConfirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  className="mt-1 w-full rounded-xl border border-zinc-300 py-3 px-4 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                {form2.formState.errors.ownerPasswordConfirm && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {form2.formState.errors.ownerPasswordConfirm.message}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-300 py-3 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 font-semibold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  Próximo
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Escolha o plano</h2>
            <p className="mt-1 text-sm text-zinc-500">
              30 dias grátis em qualquer plano. Depois você decide se continua.
            </p>
            {loadingPlans ? (
              <div className="mt-6 flex justify-center py-8">
                <div
                  className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"
                  aria-hidden
                />
              </div>
            ) : (
              <ul className="mt-6 space-y-3">
                {plans.map((plan: Plan) => {
                  const isSelected = planId === plan.id;
                  return (
                    <li key={plan.id}>
                      <button
                        type="button"
                        onClick={() => setPlanId(plan.id)}
                        className={`flex w-full items-start justify-between gap-4 rounded-xl border-2 p-4 text-left transition ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-900">{plan.name}</span>
                            {isSelected && (
                              <CheckCircleIcon className="h-5 w-5 text-amber-600" aria-hidden />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-zinc-600">
                            {formatPrice(plan.priceMonthly)}/mês · até {plan.maxBarbers} barbeiro{plan.maxBarbers !== 1 ? 's' : ''}
                          </p>
                          {plan.features && plan.features.length > 0 && (
                            <ul className="mt-2 space-y-0.5 text-xs text-zinc-500">
                              {plan.features.slice(0, 3).map((f, i) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-300 py-3 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                Voltar
              </button>
              <button
                type="button"
                onClick={onStep3Next}
                disabled={!canGoStep4}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 font-semibold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                Próximo
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </section>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Confirmar</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Revise os dados e clique em Criar barbearia.
            </p>
            <dl className="mt-6 space-y-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
              <div>
                <dt className="text-xs font-medium uppercase text-zinc-500">Barbearia</dt>
                <dd className="mt-0.5 font-medium text-zinc-900">{step1Data.name}</dd>
                <dd className="text-sm text-zinc-600">
                  Link: /{step1Data.slug?.trim() || slugFromName(step1Data.name)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-zinc-500">Dono</dt>
                <dd className="mt-0.5 font-medium text-zinc-900">{step2Data?.ownerName}</dd>
                <dd className="text-sm text-zinc-600">{step2Data?.ownerEmail}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-zinc-500">Plano</dt>
                <dd className="mt-0.5 font-medium text-zinc-900">
                  {selectedPlan?.name} — {selectedPlan && formatPrice(selectedPlan.priceMonthly)}/mês
                </dd>
                <dd className="text-sm text-zinc-600">30 dias grátis para testar</dd>
              </div>
            </dl>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-300 py-3 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                Voltar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 font-semibold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Criando...
                  </>
                ) : (
                  'Criar barbearia'
                )}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
