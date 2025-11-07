// app/insights/components/SpendsChart.tsx

import React, { useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    TextInput,
    Dimensions,
    ScrollView,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useBudget } from '../hooks/useBudget';
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

    // 🔢 Filter month transactions
    const monthTx = useMemo(
        () => transactions.filter(tx => dayjs(tx.date).isSame(currentMonth, 'month')),
        [transactions, currentMonth]
    );

    const prevMonthTx = useMemo(
        () => transactions.filter(tx => dayjs(tx.date).isSame(currentMonth.subtract(1, 'month'), 'month')),
        [transactions, currentMonth]
    );

    const daysInMonth = currentMonth.daysInMonth();
    const dailyDebit = Array(daysInMonth).fill(0);

    monthTx.forEach(tx => {
        const day = dayjs(tx.date).date() - 1;
        if (tx.type === 'debit') dailyDebit[day] += tx.amount;
    });

    const spendsTotal = dailyDebit.reduce((a, b) => a + b, 0);
    const lastMonthSpends = prevMonthTx
        .filter(tx => tx.type === 'debit')
        .reduce((a, b) => a + b, 0);

    // 📈 Monthly spends for last 6 months
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

    const formatYAxis = (value: any) => {
        const num = Number(value);

        // 🧩 Guard against undefined, NaN, null, or non-numeric strings
        if (isNaN(num) || num === undefined || num === null) return '0';

        if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    };


    // Generate one label per day, but only show 1st, mid, and last date in chart labels
    const labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

    // Keep chart neat — only render visible text on 1st, mid, and last day
    const visibleLabelIndexes = [0, Math.floor(daysInMonth / 2), daysInMonth - 1];



    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(30, 30, 30, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
        propsForBackgroundLines: { strokeDasharray: '4', strokeWidth: 0.5 },
    };

    return (
        <>
            {/* Top Summary */}
            <View style={styles.comparisonContainer}>
                <TouchableOpacity style={styles.comparisonBox} onPress={() => setShowBudgetModal(true)}>
                    <Text style={styles.smallText}>This month so far</Text>
                    <Text style={[styles.valueText, { color: '#2a9d8f' }]}>
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

            {/* Chart */}
            <View style={styles.graphCard}>
                <Text style={styles.sectionTitle}>
                    {isDaily ? 'Daily Spends Overview' : 'Monthly Spends Overview'}
                </Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {isDaily ? (
                        // 📈 Daily Line Chart
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <LineChart
                                data={{
                                    labels,
                                    datasets: [
                                        {
                                            data: dailyDebit,
                                            color: () => '#e63946',
                                            strokeWidth: 2,
                                            withDots: false,
                                        },
                                        {
                                            data: Array(daysInMonth).fill(budget),
                                            color: () => '#888',
                                            strokeWidth: 1,
                                            withDots: false,
                                        },
                                    ],
                                    legend: ['Spends', 'Budget'],
                                }}
                                width={Math.max(screenWidth - 40, labels.length * 25)}
                                height={260}
                                yAxisLabel="₹"
                                formatYLabel={(v) => formatYAxis(Number(v))}
                                formatXLabel={(xValue) => {
                                    const day = Number(xValue);
                                    const visibleDays = [1, Math.ceil(daysInMonth / 2), daysInMonth];
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
                                style={{ borderRadius: 12, marginLeft: -5 }}
                            />
                        </ScrollView>
                    ) : (
                        // 📊 Monthly Bar Chart
                        <BarChart
                            data={{
                                labels: monthlyLabels,
                                datasets: [{ data: monthlySpends }],
                            }}
                            width={screenWidth - 40}
                            height={260}
                            yAxisLabel="₹"
                            yAxisSuffix=''
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


                </ScrollView>

                {/* Toggle */}
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
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 4,
    },
    modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    modalButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 6,
    },
});
