const testimonials = [
  {
    quote: 'Minha agenda ficou cheia depois que comecei a usar. O cliente agenda sozinho e eu não perco mais horário.',
    name: 'João Silva',
    city: 'São Paulo, SP',
    result: 'Agenda cheia',
  },
  {
    quote: 'O bloqueio automático de quem falta foi um alívio. Menos stress e mais controle.',
    name: 'Carlos Mendes',
    city: 'Belo Horizonte, MG',
    result: 'Menos faltas',
  },
];

export function Testimonials() {
  return (
    <section className="border-t border-zinc-800/80 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-2xl font-bold text-zinc-100 sm:text-3xl">
          O que barbeiros dizem
        </h2>
        <p className="mt-2 text-center text-zinc-400 sm:text-lg">
          Resultados reais de quem usa no dia a dia
        </p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {testimonials.map(({ quote, name, city, result }) => (
            <li key={name}>
              <blockquote className="flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-lg">
                <p className="flex-1 text-zinc-300">&ldquo;{quote}&rdquo;</p>
                <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-800 pt-4">
                  <span className="h-10 w-10 shrink-0 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-semibold text-amber-400">
                    {name.charAt(0)}
                  </span>
                  <div>
                    <cite className="not-italic font-medium text-zinc-200">{name}</cite>
                    <p className="text-sm text-zinc-500">{city}</p>
                  </div>
                  <span className="ml-auto rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    {result}
                  </span>
                </footer>
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
