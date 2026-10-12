import Link from 'next/link';
import { deleteSession, verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { gyms, appUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import DashboardMobileNav from './DashboardMobileNav';
import { DashboardHeaderNav, NavItem } from './DashboardHeaderNav';
import { UserNav } from './UserNav';
import OnboardingBanner from './OnboardingBanner';
import { BranchProvider } from '@/contexts/BranchContext';
import { BranchSelector } from './BranchSelector';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await verifySession();
  const role = auth?.session.role || 'receptionist';

  let gymName = 'Mi Gimnasio';
  let userName = role === 'owner' ? 'Administrador' : 'Recepcionista';
  let userEmail = '';

  if (auth?.session?.gymId) {
    try {
      const [gym] = await db
        .select({ name: gyms.name })
        .from(gyms)
        .where(eq(gyms.id, auth.session.gymId))
        .limit(1);
      if (gym?.name) gymName = gym.name;

      if (auth.session.userId) {
        const [user] = await db
          .select({ fullName: appUsers.fullName, email: appUsers.email })
          .from(appUsers)
          .where(eq(appUsers.id, auth.session.userId))
          .limit(1);
        if (user?.fullName) userName = user.fullName;
        if (user?.email) userEmail = user.email;
      }
    } catch (e) {
      console.error('Error fetching layout meta:', e);
    }
  }

  const handleLogout = async () => {
    'use server';
    await deleteSession();
    redirect('/');
  };

  const navItems: NavItem[] = [
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
    <BranchProvider>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased">
        <header className="sticky top-0 z-40 h-14 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
            <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
              <div className="h-7 w-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:bg-slate-800 transition-colors">
                SD
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-slate-900">SupraData</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80">
                  PRO
                </span>
              </div>
            </Link>

            <BranchSelector />

            <div className="h-4 w-px bg-slate-200 hidden md:block" />

            <DashboardHeaderNav items={navItems} />
          </div>

          <UserNav
            gymName={gymName}
            userName={userName}
            userEmail={userEmail}
            role={role}
            logoutAction={handleLogout}
          />
        </header>

        <DashboardMobileNav items={navItems} />
        <OnboardingBanner />

        <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </BranchProvider>
  );
}
