export default function BookingLoading() {
  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center bg-zinc-50 px-4"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3" role="status">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"
          aria-hidden
        />
        <p className="text-sm text-zinc-500">Carregando página de agendamento...</p>
      </div>
    </div>
  );
}
