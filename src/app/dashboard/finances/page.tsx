import { getFinanceData } from '@/app/actions/finance';
import { FinancesClient } from './FinancesClient';

export default async function FinancesPage() {
  const financeData = await getFinanceData();

  return (
    <div className="w-full">
      <FinancesClient operationalData={financeData} />
    </div>
  );
}
