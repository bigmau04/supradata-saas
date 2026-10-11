import { ProductsClient } from './ProductsClient';
import { getAllProductsAdmin } from '@/app/actions/products';
import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProductsPage() {
  const auth = await verifySession();
  if (auth?.session?.role !== 'owner') {
    redirect('/dashboard/reception');
  }

  const products = await getAllProductsAdmin();

  return (
    <div className="w-full">
      <ProductsClient initialProducts={products} />
    </div>
  );
}
