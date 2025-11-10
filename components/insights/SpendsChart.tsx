// components/insights/SpendsChart.tsx
import React, { useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useBudget } from '@/hooks/useBudget';
import dayjs from 'dayjs';
import BudgetModal from './BudgetModal';

const screenWidth = Dimensions.get('window').width;

export default function SpendsChart({
    transactions,
    currentMonth,
    bookId,
}: {
    transactions: any[];
    currentMonth: dayjs.Dayjs;
    bookId?: string; // ✅ Optional now
}) {
    const { loadBudget, saveBudget } = useBudget();

    const [budget, setBudget] = useState<number>(0);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [tempBudget, setTempBudget] = useState<string>('0');
    const [isDaily, setIsDaily] = useState(true);

    // 🧠 Load budget only if bookId provided
    useEffect(() => {
        if (!bookId) return;
        (async () => {
            const saved = await loadBudget(bookId, currentMonth);
            if (saved) setBudget(saved);
        })();
    }, [bookId, currentMonth]);

    // 💾 Save budget (if per-book mode)
    const handleSaveBudget = async (newBudget: number) => {
        setBudget(newBudget);
        if (bookId) {
            await saveBudget(bookId, currentMonth, newBudget);
        }
    };

    // 🔢 Filter transactions for current + previous months
    const monthTx = useMemo(
        () => transactions.filter(tx => dayjs(tx.date).isSame(currentMonth, 'month')),
        [transactions, currentMonth]
    );

    const prevMonthTx = useMemo(
        () =>
            transactions.filter(tx =>
                dayjs(tx.date).isSame(currentMonth.subtract(1, 'month'), 'month')
            ),
        [transactions, currentMonth]
    );

    const daysInMonth = currentMonth.daysInMonth();
    const labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

    // 🧮 Daily debit totals
    const dailyDebit = Array(daysInMonth).fill(0);
    monthTx.forEach(tx => {
        const day = dayjs(tx.date).date() - 1;
        if (tx.type === 'debit') dailyDebit[day] += tx.amount;
    });

    // Cumulative data
    const cumulativeDebit = dailyDebit.reduce((acc, val, i) => {
        acc[i] = (i === 0 ? val : acc[i - 1] + val);
        return acc;
    }, [] as number[]);

    const today = dayjs();
    const isCurrentMonth = today.isSame(currentMonth, 'month');
    const daysToShow = isCurrentMonth ? today.date() : daysInMonth;
    const visibleData = cumulativeDebit.slice(0, daysToShow);
    const visibleLabels = labels.slice(0, daysToShow);

    const spendsTotal = visibleData[visibleData.length - 1] || 0;
    const lastMonthSpends = prevMonthTx
        .filter(tx => tx.type === 'debit')
        .reduce((sum, tx) => sum + tx.amount, 0);

    // 📊 Monthly Spends for last 6 months
    const monthlyLabels: string[] = [];
    const monthlySpends: number[] = [];
    for (let i = 5; i >= 0; i--) {
        const m = currentMonth.subtract(i, 'month');
        const total = transactions
            .filter(tx => dayjs(tx.date).isSame(m, 'month') && tx.type === 'debit')
            .reduce((sum, tx) => sum + tx.amount, 0);
        monthlyLabels.push(m.format('MMM'));
        monthlySpends.push(total);
    }

    // 💰 Format Y-axis labels
    const formatYAxis = (value: any) => {
        const num = Number(value);
        if (isNaN(num)) return '0';
        if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    };

    const chartConfig = {
        backgroundColor: '#fff',
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(30,30,30,${opacity})`,
        labelColor: (opacity = 1) => `rgba(60,60,60,${opacity})`,
        propsForBackgroundLines: { strokeDasharray: '4', strokeWidth: 0.5 },
    };

    return (
        <>
            {/* Budget Summary */}
            <View style={styles.comparisonContainer}>
                <TouchableOpacity style={styles.comparisonBox} onPress={() => setShowBudgetModal(true)}>
                    <Text style={styles.smallText}>This month so far</Text>
                    <Text style={[styles.valueText, { color: '#e63946' }]}>
                        ₹{spendsTotal.toFixed(0)} {bookId ? `/ ₹${budget.toLocaleString()}` : ''}
                    </Text>
                </TouchableOpacity>
                <View style={styles.comparisonBox}>
                    <Text style={styles.smallText}>Last month</Text>
                    <Text style={[styles.valueText, { color: '#000' }]}>
                        ₹{formatYAxis(lastMonthSpends)}
                    </Text>
                </View>
            </View>

            {/* Chart Section */}
            <View style={styles.graphCard}>
                <Text style={styles.sectionTitle}>
                    {isDaily ? 'Daily Spends Overview' : 'Monthly Spends Overview'}
                </Text>

                {isDaily ? (
                    <LineChart
                        data={{
                            labels: visibleLabels,
                            datasets: [{ data: visibleData, color: () => '#e63946', strokeWidth: 2 }],
                        }}
                        width={screenWidth - 60}
                        height={260}
                        yAxisLabel="₹"
                        formatYLabel={(v) => formatYAxis(Number(v))}
                        chartConfig={chartConfig}
                        fromZero
                        withInnerLines
                        withHorizontalLabels
                        bezier
                        segments={5}
                        style={{ borderRadius: 12 }}
                    />
                ) : (
                    <BarChart
                        data={{
                            labels: monthlyLabels,
                            datasets: [{ data: monthlySpends }],
                        }}
                        width={screenWidth - 60}
                        height={260}
                        yAxisLabel="₹"
                        yAxisSuffix=""   // ✅ Added this line
                        fromZero
                        chartConfig={{
                            ...chartConfig,
                            barPercentage: 0.6,
                            color: (opacity = 1) => `rgba(230,57,70,${opacity})`,
                            labelColor: (opacity = 1) => `rgba(60,60,60,${opacity})`,
                        }}
                        style={{ borderRadius: 12 }}
                    />

                )}

                {/* Toggle Buttons */}
                <View style={styles.toggleRow}>
                    <TouchableOpacity
                        onPress={() => setIsDaily(true)}
                        style={[styles.toggleButton, isDaily && styles.activeToggle]}
                    >
                        <Text style={isDaily ? styles.toggleTextActive : styles.toggleText}>Daily</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setIsDaily(false)}
                        style={[styles.toggleButton, !isDaily && styles.activeToggle]}
                    >
                        <Text style={!isDaily ? styles.toggleTextActive : styles.toggleText}>Monthly</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Budget Modal (shown only if bookId exists) */}
            {bookId && (
                <BudgetModal
                    visible={showBudgetModal}
                    budget={budget}
                    tempBudget={tempBudget}
                    setTempBudget={setTempBudget}
                    onCancel={() => {
                        setShowBudgetModal(false);
                        setTempBudget(String(budget));
                    }}
                    onSave={(newBudget) => {
                        handleSaveBudget(newBudget);
                        setShowBudgetModal(false);
                    }}
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    comparisonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    comparisonBox: { alignItems: 'flex-start' },
    smallText: { fontSize: 13, color: '#666' },
    valueText: { fontSize: 16, fontWeight: '700' },
    graphCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginTop: 16,
    },
    toggleButton: {
        backgroundColor: '#e0e0e0',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 6,
    },
    activeToggle: {
        backgroundColor: '#111',
    },
    toggleText: { color: '#333', fontWeight: '600' },
    toggleTextActive: { color: '#fff', fontWeight: '600' },
});
