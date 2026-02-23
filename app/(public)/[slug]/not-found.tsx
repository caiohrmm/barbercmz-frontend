import Link from 'next/link';

export default function BookingNotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-zinc-50 px-4">
      <h1 className="text-xl font-semibold text-zinc-900">
        Barbearia não encontrada
      </h1>
      <p className="text-center text-sm text-zinc-500">
        O link pode estar incorreto ou a página não existe mais.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-amber-400"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
