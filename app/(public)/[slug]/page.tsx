import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBarbershopBySlug, getPublicServices } from '@/lib/public-api';
import { BookingStageOne } from './_components/booking-stage-one';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const barbershop = await getBarbershopBySlug(slug);
  if (!barbershop) {
    return { title: 'Barbearia não encontrada' };
  }
  return {
    title: `Agendar · ${barbershop.name}`,
    description: `Agende seu horário na ${barbershop.name}. Veja serviços e preços.`,
  };
}

export default async function AppointmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const barbershop = await getBarbershopBySlug(slug);
  if (!barbershop || !barbershop.active) {
    notFound();
  }

  const { services } = await getPublicServices(barbershop.id);

  return <BookingStageOne barbershop={barbershop} services={services} />;
}

