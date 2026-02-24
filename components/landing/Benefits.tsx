import {
  CalendarDaysIcon,
  UserGroupIcon,
  ShieldExclamationIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const benefits = [
  {
    icon: CalendarDaysIcon,
    title: 'Agenda inteligente',
    description: 'Nunca mais perca horários. Tudo em um lugar e sincronizado.',
  },
  {
    icon: UserGroupIcon,
    title: 'Controle de clientes',
    description: 'Histórico completo: quem agendou, quem faltou, quem voltou.',
  },
  {
    icon: ShieldExclamationIcon,
    title: 'Menos faltas',
    description: 'Bloqueio automático após faltas. Menos buraco na agenda.',
  },
  {
    icon: ChartBarIcon,
    title: 'Mais faturamento',
    description: 'Agenda cheia e organizada = mais cortes e mais receita.',
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-bold text-zinc-100 sm:text-3xl">
          Tudo que sua barbearia precisa
        </h2>
        <p className="mt-2 text-center text-zinc-400 sm:text-lg">
          Ferramentas simples que resolvem o dia a dia
        </p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, description }) => (
            <li key={title}>
              <article className="flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-lg transition hover:border-zinc-700 hover:bg-zinc-800/60 focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 focus-within:ring-offset-[var(--background)]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-4 font-semibold text-zinc-100">{title}</h3>
                <p className="mt-2 flex-1 text-sm text-zinc-400">{description}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
