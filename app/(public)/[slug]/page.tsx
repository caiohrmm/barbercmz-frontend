import { Suspense } from 'react';

function AppointmentPageContent({ slug }: { slug: string }) {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="mx-auto max-w-md">
        <h1 className="mb-4 text-2xl font-bold">Agendamento</h1>
        <p className="text-gray-600">Slug: {slug}</p>
        <p className="mt-4 text-sm text-gray-500">
          Página pública de agendamento - Em desenvolvimento
        </p>
      </div>
    </div>
  );
}

export default function AppointmentPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Carregando...</div>
        </div>
      }
    >
      <AppointmentPageContent slug={params.slug} />
    </Suspense>
  );
}

