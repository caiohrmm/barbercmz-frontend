'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const faqs = [
  {
    question: 'Preciso colocar cartão de crédito para testar?',
    answer: 'Não. Você cria sua barbearia, usa 30 dias grátis e só depois decide se quer continuar. Nenhum dado de cartão é pedido no início.',
  },
  {
    question: 'Como meu cliente agenda?',
    answer: 'Você recebe um link (ex: barbercmz.com/sua-barbearia). Seu cliente acessa no celular, escolhe o serviço, o barbeiro e o horário. Na hora aparece na sua agenda.',
  },
  {
    question: 'O que acontece se alguém faltar?',
    answer: 'Você marca a falta no sistema. Após 2 faltas, o cliente é bloqueado automaticamente e não consegue mais agendar até você desbloquear.',
  },
  {
    question: 'Posso mudar de plano depois?',
    answer: 'Sim. No painel você pode trocar de plano a qualquer momento. Se tiver mais barbeiros que o plano permite, precisará desativar alguns antes de fazer downgrade.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 border-t border-zinc-800/80 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold text-zinc-100 sm:text-3xl">
          Perguntas frequentes
        </h2>
        <p className="mt-2 text-center text-zinc-400 sm:text-lg">
          Dúvidas comuns sobre o BarberCMZ
        </p>
        <ul className="mt-10 space-y-2">
          {faqs.map((faq, index) => (
            <li key={index}>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-zinc-100 hover:bg-zinc-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset"
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                >
                  {faq.question}
                  <ChevronDownIcon
                    className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className={`border-t border-zinc-800 ${openIndex === index ? 'block' : 'hidden'}`}
                >
                  <p className="px-5 py-4 text-sm text-zinc-400">{faq.answer}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
