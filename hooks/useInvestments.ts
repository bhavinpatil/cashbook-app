// hooks/useInvestments.ts
import { Transaction } from '@/types/types';

export const useInvestments = (transactions: Transaction[]) => {
  const investments = transactions.filter(
    tx => tx.category?.toLowerCase() === 'investment'
  );

  const getTypeData = () => {
    const map: Record<string, number> = {};
    investments.forEach(tx => {
      const type = tx.investmentType ?? 'Uncategorized';
      map[type] = (map[type] || 0) + tx.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  };

  const getMonthlyTrend = () => {
    const map: Record<string, number> = {};
    investments.forEach(tx => {
      const month = new Date(tx.date).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      map[month] = (map[month] || 0) + tx.amount;
    });
    const labels = Object.keys(map);
    const values = labels.map(l => map[l]);
    return { labels, values };
  };

  const getTotalInvested = () =>
    investments.reduce((sum, tx) => sum + tx.amount, 0);

  return { getTypeData, getMonthlyTrend, getTotalInvested };
};
