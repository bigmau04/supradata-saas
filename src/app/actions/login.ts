'use server'

import { db } from '@/db';
import { appUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'Ingresa correo y contraseña' };
  }

  try {
    const [user] = await db.select().from(appUsers).where(eq(appUsers.email, email)).limit(1);
    
    if (!user || !user.passwordHash) {
      return { success: false, message: 'Credenciales inválidas' };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { success: false, message: 'Credenciales inválidas' };
    }

    await createSession({
      userId: user.id,
      gymId: user.gymId as string,
      branchId: user.branchId,
      role: user.role as 'owner' | 'receptionist'
    });

  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: 'Error al iniciar sesión' };
  }

  redirect('/dashboard');
}
