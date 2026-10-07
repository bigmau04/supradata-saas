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
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestión de Tienda</h1>
        <ProductsClient initialProducts={products} />
      </div>
    </div>
  );
}
