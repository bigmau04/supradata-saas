'use server'

import { db } from '@/db';
import { gyms, branches, appUsers, membershipPlans } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function registerGymAction(formData: FormData) {
  const gymName = formData.get('gymName') as string;
  const taxId = formData.get('taxId') as string;
  const ownerName = formData.get('ownerName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!gymName || !taxId || !ownerName || !email || !password) {
    return { success: false, message: 'Todos los campos son obligatorios' };
  }

  const existingUser = await db.select().from(appUsers).where(eq(appUsers.email, email)).limit(1);
  if (existingUser.length > 0) {
    return { success: false, message: 'El correo electrónico ya está registrado' };
  }

  const slug = gymName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const [newGym] = await db.insert(gyms).values({
      name: gymName,
      slug,
      taxId
    }).returning();

    const [newBranch] = await db.insert(branches).values({
      gymId: newGym.id,
      name: 'Sede Principal'
    }).returning();

    const [newUser] = await db.insert(appUsers).values({
      gymId: newGym.id,
      branchId: newBranch.id,
      email,
      passwordHash,
      fullName: ownerName,
      role: 'owner'
    }).returning();

    await db.insert(membershipPlans).values({
      gymId: newGym.id,
      name: 'Pase Diario Exprés',
      durationDays: 1,
      price: '10000',
      isActive: true
    });

    await createSession({
      userId: newUser.id,
      gymId: newGym.id,
      branchId: newBranch.id,
      role: newUser.role
    });

  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: 'Error al registrar el gimnasio' };
  }

  redirect('/dashboard');
}
