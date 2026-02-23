'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/providers/auth-provider';
import { getBarbershopById, uploadBarbershopLogo } from '@/lib/barbershop';
import type { Barbershop } from '@/types';
import { ArrowLeftIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_SIZE_MB = 5;

export default function SettingsPage() {
  const { user } = useAuth();
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user?.barbershopId) return;
    let cancelled = false;
    getBarbershopById(user.barbershopId)
      .then((data) => {
        if (!cancelled) setBarbershop(data);
      })
      .catch(() => {
        if (!cancelled) setBarbershop(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.barbershopId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.barbershopId) return;

    if (!ACEPT.split(',').map((t) => t.trim()).includes(file.type)) {
      setMessage({ type: 'error', text: 'Formato inválido. Use JPEG, PNG, WebP ou GIF.' });
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setMessage({ type: 'error', text: `Arquivo muito grande. Máximo ${MAX_SIZE_MB} MB.` });
      return;
    }

    setMessage(null);
    setUploading(true);
    try {
      const { barbershop: updated } = await uploadBarbershopLogo(user.barbershopId, file);
      setBarbershop(updated);
      setMessage({ type: 'success', text: 'Logo atualizada. Ela será exibida na página de agendamento.' });
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Não foi possível enviar a logo. Tente novamente.';
      setMessage({ type: 'error', text: msg || 'Erro ao enviar logo.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-4">
        <span className="text-zinc-500">Carregando...</span>
      </div>
    );
  }

  if (!barbershop) {
    return (
      <div className="p-4">
        <p className="text-red-600">Não foi possível carregar os dados da barbearia.</p>
        <Link href="/dashboard" className="mt-2 inline-flex items-center gap-1 text-sm text-zinc-600 hover:underline">
          <ArrowLeftIcon className="h-4 w-4" /> Voltar ao dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg p-1 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          aria-label="Voltar ao dashboard"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">Configurações</h1>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-zinc-800">Logo da barbearia</h2>
        <p className="mb-4 text-sm text-zinc-500">
          A logo aparece na página de agendamento (<strong>/{barbershop.slug}</strong>). Será convertida para WebP para melhor desempenho.
        </p>

        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
            {barbershop.logoUrl ? (
              <Image
                src={barbershop.logoUrl}
                alt="Logo atual"
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              <PhotoIcon className="h-10 w-10 text-zinc-400" aria-hidden />
            )}
          </div>
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2">
              <input
                type="file"
                accept={ACCEPT}
                onChange={handleFileChange}
                disabled={uploading}
                className="sr-only"
              />
              {uploading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" aria-hidden />
                  Enviando...
                </>
              ) : (
                <>
                  <PhotoIcon className="h-5 w-5" aria-hidden />
                  Escolher imagem
                </>
              )}
            </label>
            <p className="mt-2 text-xs text-zinc-500">JPEG, PNG, WebP ou GIF. Máx. {MAX_SIZE_MB} MB.</p>
          </div>
        </div>

        {message && (
          <div
            role="alert"
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}
      </section>
    </div>
  );
}
