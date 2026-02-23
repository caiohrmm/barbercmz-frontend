import Link from 'next/link';

export default function BookingNotFound() {
  return (
    <main
      className="flex min-h-[100dvh] flex-col items-center justify-center gap-5 bg-zinc-50 px-4"
      role="main"
      aria-label="Página não encontrada"
    >
      <div className="rounded-full bg-zinc-200 p-4">
        <span className="text-2xl font-bold text-zinc-500" aria-hidden>404</span>
      </div>
      <h1 className="text-center text-xl font-semibold text-zinc-900">
        Barbearia não encontrada
      </h1>
      <p className="max-w-xs text-center text-sm text-zinc-600">
        O link pode estar incorreto ou a página não existe mais.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-medium text-zinc-950 shadow-sm hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
