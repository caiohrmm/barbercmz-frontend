import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

const steps = [
  {
    step: 1,
    title: 'Crie sua barbearia',
    description: 'Cadastre nome, endereço da página e escolha um plano. Leva menos de 2 minutos.',
  },
  {
    step: 2,
    title: 'Configure horários e serviços',
    description: 'Defina os serviços (corte, barba, preços) e os horários de cada barbeiro.',
  },
  {
    step: 3,
    title: 'Compartilhe seu link',
    description: 'Seus clientes acessam seu link, escolhem horário e barbeiro. Sem ligação, sem mensagem perdida.',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-20 border-t border-zinc-800/80 bg-zinc-900/40 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-zinc-100 sm:text-3xl">
          Como funciona
        </h2>
        <p className="mt-2 text-center text-zinc-400 sm:text-lg">
          Em 3 passos você está recebendo agendamentos
        </p>
        <ol className="mt-10 space-y-8">
          {steps.map(({ step, title, description }) => (
            <li key={step} className="flex gap-4 sm:gap-6">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-zinc-950"
                aria-hidden
              >
                {step}
              </span>
              <div>
                <h3 className="font-semibold text-zinc-100">{title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{description}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-center">
          <Link
            href={ROUTES.CRIAR_BARBEARIA}
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          >
            Começar agora — 30 dias grátis
          </Link>
        </p>
      </div>
    </section>
  );
}
