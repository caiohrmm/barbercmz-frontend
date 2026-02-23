'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import {
  PlusIcon,
  PencilSquareIcon,
  UserGroupIcon,
  ArrowPathIcon,
  NoSymbolIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { getBarbers, createBarber, updateBarber } from '@/lib/barbers';
import { getBarbershopById } from '@/lib/barbershop';
import { useAuth } from '@/lib/providers/auth-provider';
import type { Barber } from '@/types';
import { createBarberSchema, type CreateBarberInput } from '@/lib/validators';

export default function BarbersPage() {
  const { user } = useAuth();
  const barbershopId = user?.barbershopId;
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const { data: barbershop } = useQuery({
    queryKey: ['barbershop', barbershopId],
    queryFn: () => getBarbershopById(barbershopId!),
    enabled: !!barbershopId,
  });

  const { data: allBarbers = [], isLoading, error } = useQuery({
    queryKey: ['barbers'],
    queryFn: () => getBarbers(),
    enabled: !!barbershopId,
  });

  const barbers = showInactive
    ? allBarbers.filter((b) => !b.active)
    : allBarbers.filter((b) => b.active);
  const activeCount = allBarbers.filter((b) => b.active).length;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateBarberInput>({
    resolver: zodResolver(createBarberSchema),
    defaultValues: { name: '' },
  });

  const openCreate = () => {
    setEditingBarber(null);
    reset({ name: '' });
    setShowForm(true);
  };

  const openEdit = (b: Barber) => {
    setEditingBarber(b);
    reset({ name: b.name });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBarber(null);
  };

  const createMutation = useMutation({
    mutationFn: createBarber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers'] });
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: { name?: string } }) =>
      updateBarber(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['barbers'] });
      closeForm();
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateBarber(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbers'] });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (editingBarber) {
      await updateMutation.mutateAsync({ id: editingBarber.id, input: { name: values.name } });
    } else {
      await createMutation.mutateAsync(values);
    }
  });

  const maxBarbers = barbershop?.maxBarbers ?? 1;
  const canAddMore = activeCount < maxBarbers;

  if (!barbershopId) {
    return (
      <div className="px-4 pb-24 pt-6 sm:px-6">
        <p className="font-medium text-zinc-600">Acesso não disponível.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 pt-6 sm:px-6 md:pb-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {activeCount} de {maxBarbers} barbeiros no plano
          {!canAddMore && (
            <span className="ml-1 text-amber-600">(limite atingido)</span>
          )}
        </p>
        <Link
          href="/dashboard/billing"
          className="text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          Ver plano
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowInactive(false)}
          className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
            !showInactive ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          Ativos
        </button>
        <button
          type="button"
          onClick={() => setShowInactive(true)}
          className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
            showInactive ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          Inativos
        </button>
      </div>

      {canAddMore && (
        <button
          type="button"
          onClick={openCreate}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-200 bg-white py-4 text-sm font-medium text-zinc-600 hover:border-amber-200 hover:bg-amber-50/30 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          <PlusIcon className="h-5 w-5" aria-hidden />
          Adicionar barbeiro
        </button>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-800">Erro ao carregar barbeiros</p>
          <p className="mt-1 text-sm text-red-700">
            {(error as Error)?.message ?? 'Tente novamente.'}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"
            aria-hidden
          />
        </div>
      ) : barbers.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <UserGroupIcon className="mx-auto h-12 w-12 text-zinc-300" aria-hidden />
          <p className="mt-3 font-medium text-zinc-600">
            {showInactive ? 'Nenhum barbeiro inativo' : 'Nenhum barbeiro cadastrado'}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {showInactive
              ? 'Altere o filtro para Ativos.'
              : canAddMore
                ? 'Clique em Adicionar barbeiro para começar.'
                : 'Atingiu o limite do plano. Altere o plano em Faturamento para cadastrar mais.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {barbers.map((barber) => (
            <li
              key={barber.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <p className={`font-semibold ${barber.active ? 'text-zinc-900' : 'text-zinc-500'}`}>
                  {barber.name}
                </p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    barber.active ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {barber.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(barber)}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label={`Editar ${barber.name}`}
                >
                  <PencilSquareIcon className="h-5 w-5" aria-hidden />
                </button>
                {barber.active ? (
                  <button
                    type="button"
                    onClick={() =>
                      toggleActiveMutation.mutate({ id: barber.id, active: false })
                    }
                    disabled={toggleActiveMutation.isPending}
                    className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    aria-label={`Desativar ${barber.name}`}
                    title="Desativar"
                  >
                    <NoSymbolIcon className="h-5 w-5" aria-hidden />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      toggleActiveMutation.mutate({ id: barber.id, active: true })
                    }
                    disabled={toggleActiveMutation.isPending || !canAddMore}
                    className="rounded-lg p-2 text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    aria-label={`Reativar ${barber.name}`}
                    title="Reativar"
                  >
                    <CheckCircleIcon className="h-5 w-5" aria-hidden />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal criar/editar */}
      <Transition show={showForm}>
        <Dialog onClose={closeForm} className="relative z-50">
          <TransitionChild
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-zinc-900/30" aria-hidden="true" />
          </TransitionChild>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
                <DialogTitle className="text-lg font-semibold text-zinc-900">
                  {editingBarber ? 'Editar barbeiro' : 'Novo barbeiro'}
                </DialogTitle>
                <form onSubmit={onSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="barber-name" className="block text-sm font-medium text-zinc-700">
                      Nome
                    </label>
                    <input
                      {...register('name')}
                      id="barber-name"
                      type="text"
                      autoComplete="name"
                      className="mt-1 w-full rounded-xl border border-zinc-300 py-3 px-4 text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      placeholder="Ex.: João Silva"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeForm}
                      className="flex-1 rounded-xl border border-zinc-300 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                      className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-medium text-zinc-950 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-70"
                    >
                      {isSubmitting || createMutation.isPending || updateMutation.isPending ? (
                        <span className="inline-flex items-center gap-2">
                          <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden />
                          Salvando...
                        </span>
                      ) : editingBarber ? (
                        'Salvar'
                      ) : (
                        'Cadastrar'
                      )}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
