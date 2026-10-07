import { db } from '@/db';
import { gyms, branches, membershipPlans, appUsers } from '@/db/schema';
import { createSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  // 1. Crear o recuperar Gimnasio
  let [gym] = await db.select().from(gyms).where(eq(gyms.slug, 'gorilla-fitness'));
  
  if (!gym) {
    [gym] = await db.insert(gyms).values({
      name: 'Gorilla Fitness',
      slug: 'gorilla-fitness'
    }).returning();
  }

  // 2. Crear o recuperar Sede
  let [branch] = await db.select().from(branches).where(eq(branches.gymId, gym.id));
  if (!branch) {
    [branch] = await db.insert(branches).values({
      gymId: gym.id,
      name: 'Sede Central',
      address: 'Avenida Siempre Viva 742'
    }).returning();
  }

  // 3. Crear Planes de prueba
  let [existingPlan] = await db.select().from(membershipPlans).where(eq(membershipPlans.gymId, gym.id));
  if (!existingPlan) {
    await db.insert(membershipPlans).values([
      { gymId: gym.id, name: 'Mensualidad', durationDays: 30, price: '80000.00' },
      { gymId: gym.id, name: 'Quincena', durationDays: 15, price: '45000.00' }
    ]);
  }

  // 4. Crear Usuario Administrador de prueba
  let [user] = await db.select().from(appUsers).where(eq(appUsers.email, 'admin@gorillafitness.com'));
  if (!user) {
    [user] = await db.insert(appUsers).values({
      gymId: gym.id,
      branchId: branch.id,
      email: 'admin@gorillafitness.com',
      passwordHash: 'dummy-hash-para-dev', 
      fullName: 'Admin Recepción',
      role: 'superadmin'
    }).returning();
  }

  // 5. Establecer Cookie Segura de Sesión
  await createSession({
    userId: user.id,
    gymId: gym.id,
    branchId: branch.id,
    role: user.role
  });

  // Redirigir al dashboard
  const baseUrl = new URL(request.url).origin;
  return NextResponse.redirect(new URL('/dashboard/members', baseUrl));
}
