import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planos e preços | BarberCMZ',
  description:
    'Planos para barbearias: 1 barbeiro R$ 40/mês, até 5 barbeiros R$ 60/mês, 5+ barbeiros R$ 80/mês. 30 dias grátis para testar.',
};

export default function PlanosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
