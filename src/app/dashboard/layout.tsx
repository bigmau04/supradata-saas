import Link from 'next/link';
import { Dumbbell, LogOut } from 'lucide-react';
import { deleteSession, verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardMobileNav from './DashboardMobileNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await verifySession();
  const role = auth?.session.role;
  const handleLogout = async () => {
    'use server';
    await deleteSession();
    redirect('/');
  };

  const mobileItems = [
    ...(role === 'owner' ? [{ href: '/dashboard', label: 'Resumen' }] : []),
    { href: '/dashboard/reception', label: 'Recepción' },
    { href: '/dashboard/members', label: 'Miembros' },
    ...(role === 'owner'
      ? [
          { href: '/dashboard/plans', label: 'Planes' },
          { href: '/dashboard/coaches', label: 'Entrenadores' },
          { href: '/dashboard/finances', label: 'Finanzas' },
          { href: '/dashboard/team', label: 'Equipo' },
          { href: '/dashboard/products', label: 'Tienda' },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
                <Dumbbell className="h-6 w-6" />
                SupraData
              </Link>
              <div className="hidden md:flex gap-6">
                {role === 'owner' && <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">Resumen</Link>}
                <Link href="/dashboard/reception" className="text-gray-600 hover:text-gray-900 font-medium">Recepción</Link>
                <Link href="/dashboard/members" className="text-gray-600 hover:text-gray-900 font-medium">Miembros</Link>
                {role === 'owner' && (
                  <>
                    <Link href="/dashboard/plans" className="text-gray-600 hover:text-gray-900 font-medium">Planes</Link>
                    <Link href="/dashboard/coaches" className="text-gray-600 hover:text-gray-900 font-medium">Entrenadores</Link>
                    <Link href="/dashboard/finances" className="text-gray-600 hover:text-gray-900 font-medium">Finanzas</Link>
                    <Link href="/dashboard/team" className="text-gray-600 hover:text-gray-900 font-medium">Equipo</Link>
                    <Link href="/dashboard/products" className="text-gray-600 hover:text-gray-900 font-medium">Tienda</Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <form action={handleLogout}>
                <button type="submit" aria-label="Salir" className="text-gray-500 hover:text-red-600 flex items-center gap-2 font-medium transition min-h-[44px] px-2">
                  <LogOut className="h-5 w-5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </form>
            </div>
          </div>
        </div>
        <DashboardMobileNav items={mobileItems} />
      </nav>
      <main>
        {children}
      </main>
    </div>
  );
}
