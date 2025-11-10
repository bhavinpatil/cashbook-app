// hooks/useInsights.ts 
import { Transaction } from '@/types/types';
export const useInsights = (transactions: Transaction[]) => {
    // ---------- Pie Chart: Category-wise total debit ----------
    const getCategoryData = () => {
        const categoryMap: { [key: string]: number } = {};

        transactions.forEach(tx => {
            if (tx.type === 'debit') {
                categoryMap[tx.category ?? 'Other'] =
                    (categoryMap[tx.category ?? 'Other'] || 0) + tx.amount;
            }
        });

        return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    };


    // ---------- Bar Chart: Monthly credit vs debit ----------
    const getMonthlyData = () => {
        const monthlyMap: { [month: string]: { credit: number; debit: number } } = {};

        transactions.forEach(tx => {
            const month = new Date(tx.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!monthlyMap[month]) monthlyMap[month] = { credit: 0, debit: 0 };
            monthlyMap[month][tx.type] += tx.amount;
        });

        const labels = Object.keys(monthlyMap);
        const creditData = labels.map(l => monthlyMap[l].credit);
        const debitData = labels.map(l => monthlyMap[l].debit);

        if (!labels.length) {
            return { labels: ['N/A'], creditData: [0], debitData: [0] };
        }

        return { labels, creditData, debitData };
    };

    // ---------- Line Chart: Balance trend over time ----------
    const getBalanceTrend = () => {
        let balance = 0;
        const trend = transactions
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(tx => {
                balance += tx.type === 'credit' ? tx.amount : -tx.amount;
                return { date: tx.date, balance };
            });

        if (!trend.length) return [{ date: new Date().toISOString(), balance: 0 }];

        return trend;
    };

    // ---------- Total credit, total debit, and balance ----------
    const getTotals = () => {
        const totalCredit = transactions
            .filter(tx => tx.type === 'credit')
            .reduce((acc, tx) => acc + tx.amount, 0);
        const totalDebit = transactions
            .filter(tx => tx.type === 'debit')
            .reduce((acc, tx) => acc + tx.amount, 0);
        const balance = totalCredit - totalDebit;
        return { totalCredit, totalDebit, balance };
    };

    // ---------- Average monthly spending per category ----------
    const getAverageCategorySpending = () => {
        const categoryData = getCategoryData();
        const monthlyData = getMonthlyData();
        const monthsCount = monthlyData.labels.length || 1;

        return categoryData.map(cat => ({
            name: cat.name,
            average: +(cat.value / monthsCount).toFixed(2),
        }));
    };

    // ---------- Top N spending categories ----------
    const getTopCategories = (topN: number = 5) => {
        const sorted = getCategoryData().sort((a, b) => b.value - a.value);
        return sorted.slice(0, topN);
    };

    return {
        getCategoryData,
        getMonthlyData,
        getBalanceTrend,
        getTotals,
        getAverageCategorySpending,
        getTopCategories,
    };
};
