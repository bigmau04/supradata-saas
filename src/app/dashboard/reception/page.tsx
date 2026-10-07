import { ReceptionClient } from './ReceptionClient';
import { getCoaches } from '@/app/actions/coaches';
import { getProducts } from '@/app/actions/products';
import { getActiveShift } from '@/app/actions/cash_shifts';
import { verifySession } from '@/lib/auth';

export default async function ReceptionPage() {
  const coaches = await getCoaches();
  const products = await getProducts();
  const activeShift = await getActiveShift();
  const auth = await verifySession();
  const userRole = auth?.session?.role || 'receptionist';
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-12 flex items-center justify-center">
      <div className="w-full">
         <ReceptionClient coaches={coaches.filter(c => c.isActive)} products={products} activeShift={activeShift} userRole={userRole} />
      </div>
    </div>
  );
}
