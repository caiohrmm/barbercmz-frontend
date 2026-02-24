import { StarIcon } from '@heroicons/react/24/solid';

export function SocialProof() {
  return (
    <section className="border-y border-zinc-800/80 bg-zinc-900/40 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between sm:gap-8">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5" aria-label="4,8 de 5 estrelas">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon key={i} className="h-5 w-5 text-amber-400" aria-hidden />
              ))}
            </div>
            <span className="text-sm font-medium text-zinc-300">4,8</span>
            <span className="text-sm text-zinc-500">(avaliação)</span>
          </div>
          <p className="text-center text-zinc-400 sm:text-left">
            <strong className="font-semibold text-zinc-200">+50 barbeiros</strong> já usam o BarberCMZ
          </p>
          <blockquote className="max-w-sm text-center text-sm italic text-zinc-500 sm:text-left">
            &ldquo;Minha agenda ficou cheia depois que comecei a usar.&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  );
}
