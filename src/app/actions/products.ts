'use server'

import { db } from '@/db';
import { products, payments } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifySession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getProducts() {
  const auth = await verifySession();
  if (!auth) return [];
  
  return db.select()
    .from(products)
    .where(and(eq(products.gymId, auth.session.gymId), eq(products.isActive, true)))
    .orderBy(desc(products.createdAt));
}

export async function getAllProductsAdmin() {
  const auth = await verifySession();
  if (!auth) return [];
  
  return db.select()
    .from(products)
    .where(eq(products.gymId, auth.session.gymId))
    .orderBy(desc(products.createdAt));
}

export async function createProduct(formData: FormData) {
  const auth = await verifySession();
  if (!auth || auth.session.role !== 'owner') return { success: false, message: 'No autorizado' };

  const name = formData.get('name') as string;
  const price = formData.get('price') as string;

  if (!name || !price) return { success: false, message: 'Campos requeridos' };

  try {
    await db.insert(products).values({
      gymId: auth.session.gymId,
      name,
      price
    });
    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard/reception');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al crear producto' };
  }
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  const auth = await verifySession();
  if (!auth || auth.session.role !== 'owner') return { success: false };

  await db.update(products).set({ isActive }).where(and(eq(products.id, id), eq(products.gymId, auth.session.gymId)));
  revalidatePath('/dashboard/products');
  revalidatePath('/dashboard/reception');
  return { success: true };
}

export async function sellProduct(formData: FormData) {
  const auth = await verifySession();
  if (!auth) return { success: false, message: 'No autorizado' };

  const productId = formData.get('productId') as string;
  const method = formData.get('method') as 'cash' | 'transfer';
  const amountStr = formData.get('amount') as string;
  const quantity = formData.get('quantity') as string || '1';

  if (!productId || !method || !amountStr) return { success: false, message: 'Faltan datos' };

  try {
    // 1. Fetch product to optionally add to notes or ensure valid
    const [product] = await db.select().from(products).where(and(eq(products.id, productId), eq(products.gymId, auth.session.gymId)));
    if (!product) return { success: false, message: 'Producto no encontrado' };

    // 2. Insert payment
    await db.insert(payments).values({
      gymId: auth.session.gymId,
      branchId: auth.session.branchId!,
      registeredByUserId: auth.session.userId,
      amount: amountStr,
      method,
      concept: 'product_sale',
      status: 'paid',
      notes: `Venta de mostrador: ${quantity}x ${product.name}`
    });

    revalidatePath('/dashboard/reception');
    revalidatePath('/dashboard/finance');
    revalidatePath('/dashboard');

    return { success: true, message: `Venta exitosa: ${product.name}` };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error procesando la venta' };
  }
}
