export function ProductPreview() {
  return (
    <section className="border-t border-zinc-800/80 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-2xl font-bold text-zinc-100 sm:text-3xl">
          Tudo em um só lugar
        </h2>
        <p className="mt-2 text-center text-zinc-400 sm:text-lg">
          Agenda, clientes e barbeiros no painel. Seus clientes agendam pelo link.
        </p>
        <div className="mt-10 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl">
          <div className="landing-img-wrap flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 p-6 sm:p-10">
            <div className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-700 bg-zinc-800/80 p-5 shadow-inner">
              <div className="flex items-center gap-3 border-b border-zinc-700 pb-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/20" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-24 rounded bg-zinc-600" />
                  <div className="h-2 w-32 rounded bg-zinc-700" />
                </div>
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 rounded-lg bg-zinc-800 p-3">
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-zinc-700" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2.5 w-3/4 rounded bg-zinc-600" />
                      <div className="h-2 w-1/2 rounded bg-zinc-700" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
