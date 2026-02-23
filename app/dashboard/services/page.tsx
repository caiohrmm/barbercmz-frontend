'use client';

import { useState } from 'react';
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
  TrashIcon,
  ClockIcon,
  BanknotesIcon,
  ScissorsIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { getServices, createService, updateService, deleteService } from '@/lib/services';
import type { Service } from '@/types';
import { createServiceSchema, type CreateServiceInput } from '@/lib/validators';

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['services', showInactive === false ? true : undefined],
    queryFn: () => getServices(showInactive ? {} : { active: true }),
  });

  const services = data?.services ?? [];

  type ServiceFormValues = CreateServiceInput & { active?: boolean };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: { name: '', duration: 30, price: 0, active: true },
  });

  const openCreate = () => {
    setEditingService(null);
    reset({ name: '', duration: 30, price: 0, active: true });
    setShowForm(true);
  };

  const openEdit = (s: Service) => {
    setEditingService(s);
    reset({ name: s.name, duration: s.duration, price: s.price, active: s.active });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingService(null);
  };

  const createMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      input,
      closeOnSuccess,
    }: {
      id: string;
      input: Parameters<typeof updateService>[1];
      closeOnSuccess?: boolean;
    }) => {
      const result = await updateService(id, input);
      return { ...result, closeOnSuccess };
    },
    onSuccess: (data: { closeOnSuccess?: boolean }) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      if (data.closeOnSuccess) closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (editingService) {
      const { active, ...rest } = values;
      await updateMutation.mutateAsync({
        id: editingService.id,
        input: { ...rest, ...(typeof active === 'boolean' ? { active } : {}) },
        closeOnSuccess: true,
      });
    } else {
      const { name, duration, price } = values;
      await createMutation.mutateAsync({ name, duration, price });
    }
  });

  const formError =
    createMutation.isError || updateMutation.isError
      ? (createMutation.error || updateMutation.error) as { response?: { data?: { error?: string } } }
      : null;
  const formErrorMessage = formError?.response?.data?.error ?? null;

  return (
    <div className="px-4 pb-24 pt-6 sm:px-6 md:pb-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {services.length} {services.length === 1 ? 'serviço' : 'serviços'}
        </p>
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-zinc-300 text-amber-500 focus:ring-amber-500"
          />
          Mostrar inativos
        </label>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12" role="status" aria-busy="true">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" aria-hidden />
          <p className="text-sm text-zinc-500">Carregando serviços...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center" role="alert">
          <p className="font-medium text-red-800">Erro ao carregar serviços</p>
          <p className="mt-1 text-sm text-red-700">Tente novamente.</p>
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <ScissorsIcon className="mx-auto h-12 w-12 text-zinc-300" aria-hidden />
          <p className="mt-3 font-medium text-zinc-600">
            {showInactive ? 'Nenhum serviço cadastrado' : 'Nenhum serviço ativo'}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Adicione o primeiro serviço para aparecer na página de agendamento.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-5 w-5" aria-hidden />
            Adicionar serviço
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-3" role="list">
            {services.map((service) => (
              <li
                key={service.id}
                className={`rounded-2xl border bg-white shadow-sm transition ${
                  service.active ? 'border-zinc-200' : 'border-zinc-100 bg-zinc-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold ${service.active ? 'text-zinc-900' : 'text-zinc-500'}`}>
                      {service.name}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-zinc-500">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" aria-hidden />
                        {formatDuration(service.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <BanknotesIcon className="h-4 w-4" aria-hidden />
                        {formatPrice(service.price)}
                      </span>
                    </div>
                    {!service.active && (
                      <p className="mt-1 text-xs text-zinc-400">Inativo — não aparece no agendamento</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {service.active ? (
                      <>
                        <button
                          type="button"
                          onClick={() => openEdit(service)}
                          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          aria-label="Editar"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Desativar este serviço? Ele deixará de aparecer no agendamento.')) {
                              deleteMutation.mutate(service.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                          aria-label="Desativar"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          updateMutation.mutate({
                            id: service.id,
                            input: { active: true },
                            closeOnSuccess: false,
                          })
                        }
                        disabled={updateMutation.isPending}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        Reativar
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={openCreate}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-200 bg-white py-4 text-sm font-medium text-zinc-600 hover:border-amber-200 hover:bg-amber-50/30 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-5 w-5" aria-hidden />
            Adicionar serviço
          </button>
        </>
      )}

      {/* Modal formulário */}
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
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          </TransitionChild>
          <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4">
            <TransitionChild
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="w-full max-w-lg rounded-t-2xl border-t border-zinc-200 bg-white shadow-xl sm:rounded-2xl sm:border">
                <div className="sticky top-0 rounded-t-2xl border-b border-zinc-100 bg-white px-4 py-4 sm:rounded-2xl">
                  <DialogTitle className="text-lg font-semibold text-zinc-900">
                    {editingService ? 'Editar serviço' : 'Novo serviço'}
                  </DialogTitle>
                </div>
                <form onSubmit={onSubmit} className="space-y-4 p-4">
                  {formErrorMessage && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                      {formErrorMessage}
                    </div>
                  )}
                  <div>
                    <label htmlFor="service-name" className="block text-sm font-medium text-zinc-700">
                      Nome
                    </label>
                    <input
                      {...register('name')}
                      id="service-name"
                      type="text"
                      placeholder="Ex: Corte de cabelo"
                      className="mt-1 w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600" role="alert">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="service-duration" className="block text-sm font-medium text-zinc-700">
                        Duração (min)
                      </label>
                      <input
                        {...register('duration', { valueAsNumber: true })}
                        id="service-duration"
                        type="number"
                        min={1}
                        step={1}
                        className="mt-1 w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                      {errors.duration && (
                        <p className="mt-1 text-sm text-red-600" role="alert">
                          {errors.duration.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="service-price" className="block text-sm font-medium text-zinc-700">
                        Preço (R$)
                      </label>
                      <input
                        {...register('price', { valueAsNumber: true })}
                        id="service-price"
                        type="number"
                        min={0}
                        step={0.01}
                        className="mt-1 w-full rounded-xl border border-zinc-300 px-4 py-3 text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600" role="alert">
                          {errors.price.message}
                        </p>
                      )}
                    </div>
                  </div>
                  {editingService && (
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3">
                      <input
                        {...register('active')}
                        type="checkbox"
                        className="h-4 w-4 rounded border-zinc-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-sm font-medium text-zinc-700">
                        Serviço ativo (aparece na página de agendamento)
                      </span>
                    </label>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeForm}
                      className="flex-1 rounded-xl border border-zinc-300 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-medium text-zinc-950 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden />
                          Salvando...
                        </>
                      ) : editingService ? (
                        'Salvar'
                      ) : (
                        'Adicionar'
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
