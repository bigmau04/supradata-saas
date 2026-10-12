import { getFinanceData } from '@/app/actions/finance';
import { FinancesClient } from './FinancesClient';

export default async function FinancesPage() {
  let financeData = null;
  try {
    financeData = await getFinanceData();
  } catch (error) {
    console.error('[FinancesPage] Error fetching data:', error);
  }

  return (
    <div className="w-full">
      <FinancesClient operationalData={financeData} />
    </div>
  );
}
