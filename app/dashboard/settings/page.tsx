'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/providers/auth-provider';
import { getBarbershopById, uploadBarbershopLogo } from '@/lib/barbershop';
import type { Barbershop } from '@/types';
import { ArrowLeftIcon, PhotoIcon, ArrowPathIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_SIZE_MB = 5;

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: unknown; status?: number } }).response;
    const data = res?.data;
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      if (typeof d.error === 'string') return d.error;
      if (typeof d.message === 'string') return d.message;
    }
    if (res?.status === 401) return 'Sessão expirada. Faça login novamente.';
    if (res?.status === 403) return 'Sem permissão para alterar esta barbearia.';
    if (res?.status === 503) return 'Serviço de imagens indisponível. Tente mais tarde.';
  }
  if (err instanceof Error) return err.message;
  return 'Não foi possível enviar a logo. Tente novamente.';
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);

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

    // Preview imediato
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setMessage(null);

    if (!ACCEPT.split(',').map((t) => t.trim()).includes(file.type)) {
      setMessage({ type: 'error', text: 'Formato inválido. Use JPEG, PNG, WebP ou GIF.' });
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setMessage({ type: 'error', text: `Arquivo muito grande. Máximo ${MAX_SIZE_MB} MB.` });
      return;
    }

    setUploading(true);
    try {
      const { barbershop: updated } = await uploadBarbershopLogo(user.barbershopId, file);
      setBarbershop(updated);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setMessage({ type: 'success', text: 'Logo atualizada. Ela será exibida na página de agendamento.' });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setMessage({ type: 'error', text: msg });
      console.error('[Settings] Erro ao enviar logo:', err);
      messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Limpar preview ao desmontar
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-4">
        <span className="text-zinc-500">Carregando...</span>
      </div>
    );
  }

  if (!barbershop) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <p className="text-red-600">Não foi possível carregar os dados da barbearia.</p>
        <Link href="/dashboard" className="mt-2 inline-flex items-center gap-1 text-sm text-zinc-600 hover:underline">
          <ArrowLeftIcon className="h-4 w-4" /> Voltar ao dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 pt-6 sm:px-6 sm:pb-8">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-zinc-800">Logo da barbearia</h2>
        <p className="mb-4 text-sm text-zinc-500">
          A logo aparece na página de agendamento (<strong>/{barbershop.slug}</strong>). Será convertida para WebP para melhor desempenho.
        </p>

        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-zinc-200 bg-zinc-50">
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Preview da imagem"
                  className="h-full w-full object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <ArrowPathIcon className="h-8 w-8 animate-spin text-white" aria-hidden />
                  </div>
                )}
              </>
            ) : barbershop.logoUrl ? (
              <Image
                src={barbershop.logoUrl}
                alt="Logo atual"
                width={112}
                height={112}
                className="h-full w-full object-cover"
              />
            ) : (
              <PhotoIcon className="h-12 w-12 text-zinc-400" aria-hidden />
            )}
          </div>
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:border-amber-400 hover:bg-amber-50/50 focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 disabled:pointer-events-none disabled:opacity-60">
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

        {/* Área de feedback sempre visível */}
        <div ref={messageRef} className="mt-4 min-h-[3.5rem]">
          {message && (
            <div
              role="alert"
              className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-sm ${
                message.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
