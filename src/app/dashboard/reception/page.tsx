import { ReceptionClient } from './ReceptionClient';
import { getCoaches } from '@/app/actions/coaches';
import { getProducts } from '@/app/actions/products';
import { getActiveShift } from '@/app/actions/cash_shifts';
import { verifySession } from '@/lib/auth';

export default async function ReceptionPage() {
  let coaches: any[] = [];
  let products: any[] = [];
  let activeShift: any = null;
  let userRole = 'receptionist';

  try {
    const auth = await verifySession();
    userRole = auth?.session?.role || 'receptionist';
    
    const [coachesData, productsData, shiftData] = await Promise.all([
      getCoaches().catch(() => []),
      getProducts().catch(() => []),
      getActiveShift().catch(() => null)
    ]);
    
    coaches = coachesData || [];
    products = productsData || [];
    activeShift = shiftData;
  } catch (error) {
    console.error('Error loading reception data:', error);
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-12 flex items-center justify-center">
      <div className="w-full">
         <ReceptionClient coaches={coaches.filter((c: any) => c.isActive)} products={products} activeShift={activeShift} userRole={userRole} />
      </div>
    </div>
  );
}
