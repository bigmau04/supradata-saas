import { getFinanceData } from '@/app/actions/finance';
import { FinancesClient } from './FinancesClient';

export default async function FinancesPage() {
  const financeData = await getFinanceData();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 pt-12">
      <FinancesClient operationalData={financeData} />
    </div>
  );
}
