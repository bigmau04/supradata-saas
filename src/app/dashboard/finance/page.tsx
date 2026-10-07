import { getFinanceData } from '@/app/actions/finance';
import { FinanceClient } from './FinanceClient';

export default async function FinancePage() {
  const data = await getFinanceData();
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-12">
      <FinanceClient data={data} />
    </div>
  );
}
