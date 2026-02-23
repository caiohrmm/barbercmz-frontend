import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">BarberCMZ</h1>
      <p className="text-gray-600">Sistema de Agendamento para Barbearias</p>
      <div className="mt-4 flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Login
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg bg-gray-600 px-6 py-3 text-white hover:bg-gray-700"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
