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
    bookId: string;
}) {
    const { loadBudget, saveBudget } = useBudget();

    const [budget, setBudget] = useState<number>(40000);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [tempBudget, setTempBudget] = useState<string>('40000');
    const [isDaily, setIsDaily] = useState(true);

    // 🧠 Load budget for current month
    useEffect(() => {
        (async () => {
            const saved = await loadBudget(bookId, currentMonth);
            if (saved) setBudget(saved);
        })();
    }, [bookId, currentMonth]);

    // 💾 Save when updated
    const handleSaveBudget = async (newBudget: number) => {
        setBudget(newBudget);
        await saveBudget(bookId, currentMonth, newBudget);
    };

    // 🔢 Filter transactions for current and previous months
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

    // 🧮 Daily + Cumulative Debits (expenses)
    const dailyDebit = Array(daysInMonth).fill(0);
    monthTx.forEach(tx => {
        const day = dayjs(tx.date).date() - 1;
        if (tx.type === 'debit') dailyDebit[day] += tx.amount;
    });

    // Convert to cumulative
    const cumulativeDebit = dailyDebit.reduce((acc, val, i) => {
        if (i === 0) acc[i] = val;
        else acc[i] = acc[i - 1] + val;
        return acc;
    }, [] as number[]);

    // 📆 Limit chart to today's date
    const today = dayjs();
    const isCurrentMonth = today.isSame(currentMonth, 'month');
    const daysToShow = isCurrentMonth ? today.date() : daysInMonth;
    const visibleData = cumulativeDebit.slice(0, daysToShow);
    const visibleLabels = labels.slice(0, daysToShow);

    const spendsTotal = visibleData[visibleData.length - 1] || 0;
    const lastMonthSpends = prevMonthTx
        .filter(tx => tx.type === 'debit')
        .reduce((a, b) => a + b, 0);

    // 📊 Monthly Spends (last 6 months)
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

    // 💰 Format Y-axis
    const formatYAxis = (value: any) => {
        const num = Number(value);
        if (isNaN(num) || num === undefined || num === null) return '0';
        if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    };

    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(30, 30, 30, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
        propsForBackgroundLines: { strokeDasharray: '4', strokeWidth: 0.5 },
        fillShadowGradientFrom: '#e63946',
        fillShadowGradientFromOpacity: 0.15,
        fillShadowGradientTo: '#fbe9eb',
        fillShadowGradientToOpacity: 0.05,
    };

    return (
        <>
            {/* Summary Section */}
            <View style={styles.comparisonContainer}>
                <TouchableOpacity style={styles.comparisonBox} onPress={() => setShowBudgetModal(true)}>
                    <Text style={styles.smallText}>This month so far</Text>
                    <Text style={[styles.valueText, { color: '#e63946' }]}>
                        ₹{spendsTotal.toFixed(0)} / ₹{budget.toLocaleString()}
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
                    <>
                        {/* 📈 Daily Cumulative Spend Line */}
                        <LineChart
                            data={{
                                labels: visibleLabels,
                                datasets: [
                                    {
                                        data: visibleData,
                                        color: () => '#e63946',
                                        strokeWidth: 2,
                                    },
                                    {
                                        data: Array(visibleData.length).fill(budget),
                                        color: () => '#888',
                                        strokeWidth: 1,
                                    },
                                ],
                            }}
                            width={screenWidth - 60}
                            height={260}
                            yAxisLabel="₹"
                            formatYLabel={(v) => formatYAxis(Number(v))}
                            formatXLabel={(xValue) => {
                                const day = Number(xValue);
                                const visibleDays = [1, Math.ceil(daysToShow / 2), daysToShow];
                                return visibleDays.includes(day)
                                    ? `${day} ${currentMonth.format('MMM')}`
                                    : '';
                            }}
                            chartConfig={chartConfig}
                            fromZero
                            withOuterLines={false}
                            withInnerLines
                            withHorizontalLabels
                            bezier
                            segments={5}
                            style={{ borderRadius: 12 }}
                        />

                        {/* Marker for Today's Spend */}
                        {isCurrentMonth && (
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 72,
                                    left: `${(daysToShow / daysInMonth) * 89}%`,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                            </View>
                        )}
                    </>
                ) : (
                    // 📊 Monthly Bar Chart (same height)
                    <BarChart
                        data={{
                            labels: monthlyLabels,
                            datasets: [{ data: monthlySpends }],
                        }}
                        width={screenWidth - 60}
                        height={260}
                        yAxisLabel="₹"
                        yAxisSuffix=""
                        fromZero
                        showValuesOnTopOfBars
                        withInnerLines
                        chartConfig={{
                            ...chartConfig,
                            barPercentage: 0.6,
                            color: (opacity = 1) => `rgba(230, 57, 70, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
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

            {/* Budget Modal */}
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