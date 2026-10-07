'use server'

import { db } from '@/db';
import { appUsers } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifySession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function getTeamMembers() {
  const auth = await verifySession();
  if (!auth) throw new Error('No autorizado');

  const members = await db.select({
    id: appUsers.id,
    fullName: appUsers.fullName,
    email: appUsers.email,
    role: appUsers.role,
    createdAt: appUsers.createdAt,
    isActive: appUsers.isActive
  })
  .from(appUsers)
  .where(eq(appUsers.gymId, auth.session.gymId))
  .orderBy(desc(appUsers.createdAt));

  return members;
}

export async function createStaffUser(formData: FormData) {
  const auth = await verifySession();
  if (!auth || auth.session.role !== 'owner') {
    return { success: false, message: 'No autorizado. Se requieren permisos de administrador.' };
  }

  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as 'owner' | 'receptionist';

  if (!fullName || !email || !password || !role) {
    return { success: false, message: 'Todos los campos son obligatorios' };
  }

  const existing = await db.select().from(appUsers).where(eq(appUsers.email, email)).limit(1);
  if (existing.length > 0) {
    return { success: false, message: 'El correo ya está en uso' };
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    
    await db.insert(appUsers).values({
      gymId: auth.session.gymId,
      branchId: auth.session.branchId,
      fullName,
      email,
      passwordHash,
      role,
      isActive: true
    });

    revalidatePath('/dashboard/team');
    return { success: true, message: 'Usuario creado exitosamente' };
  } catch (error) {
    console.error("Error creating staff:", error);
    return { success: false, message: 'Error al crear el usuario' };
  }
}
