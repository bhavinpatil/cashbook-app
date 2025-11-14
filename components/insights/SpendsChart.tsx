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
import dayjs, { Dayjs } from 'dayjs';
import { Transaction } from '@/types/types';
import { useBudget } from '@/hooks/useBudget';
import BudgetModal from './BudgetModal';
import { useTheme } from '@/contexts/ThemeContext';

const screenWidth = Dimensions.get('window').width;

interface Props {
    transactions: Transaction[];
    currentMonth: Dayjs;
}

export default function SpendsChart({ transactions, currentMonth }: Props) {
    const { theme } = useTheme();
    const { loadBudget, saveBudget } = useBudget();

    const [budget, setBudget] = useState(0);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [tempBudget, setTempBudget] = useState('0');
    const [isDaily, setIsDaily] = useState(true);

    useEffect(() => {
        (async () => {
            const saved = await loadBudget();
            if (saved) setBudget(saved);
        })();
    }, []);

    // Filter current + previous month
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
    const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);

    // Daily debit totals
    const dailyDebit = Array(daysInMonth).fill(0);
    monthTx.forEach(tx => {
        if (tx.type === 'debit') {
            const dayIndex = dayjs(tx.date).date() - 1;
            dailyDebit[dayIndex] += tx.amount;
        }
    });

    // Cumulative debit
    const cumulativeDebit: number[] = [];
    dailyDebit.forEach((v, i) => {
        cumulativeDebit[i] = v + (i > 0 ? cumulativeDebit[i - 1] : 0);
    });

    // Trim chart to today's date
    const today = dayjs();
    const isCurrentMonth = today.isSame(currentMonth, 'month');
    const daysToShow = isCurrentMonth ? today.date() : daysInMonth;

    const visibleData = cumulativeDebit.slice(0, daysToShow);
    const visibleLabels = labels.slice(0, daysToShow);

    const spendsTotal = visibleData[visibleData.length - 1] || 0;

    // ---- MONTHLY BAR CHART (restore old working logic) ----
    const monthlyLabels: string[] = [];
    const monthlySpends: number[] = [];

    for (let i = 5; i >= 0; i--) {
        const m = currentMonth.subtract(i, 'month');
        const total = transactions
            .filter(tx => tx.type === 'debit' && dayjs(tx.date).isSame(m, 'month'))
            .reduce((sum, tx) => sum + tx.amount, 0);

        monthlyLabels.push(m.format('MMM'));
        monthlySpends.push(total);
    }

    // Format Y Axis
    const formatYAxis = (value: number) => {
        if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return `${value}`;
    };

    const chartConfig = {
        backgroundColor: theme.card,
        backgroundGradientFrom: theme.card,
        backgroundGradientTo: theme.card,
        decimalPlaces: 0,
        color: (opacity = 1) => theme.textDark,
        labelColor: (opacity = 1) => theme.textLight,
        propsForBackgroundLines: {
            strokeDasharray: '4',
            stroke: theme.border,
            strokeWidth: 0.5,
        },
    };

    const percentUsed =
        budget > 0 ? Math.min((spendsTotal / budget) * 100, 100).toFixed(1) : '0';

    return (
        <>
            {/* HEADER COMPARISON */}
            <View style={styles.comparisonRow}>
                <TouchableOpacity onPress={() => setShowBudgetModal(true)}>
                    <Text style={[styles.smallText, { color: theme.textLight }]}>
                        This month so far
                    </Text>
                    <Text style={[styles.valueText, { color: '#e63946' }]}>
                        ₹{spendsTotal} / ₹{budget}
                    </Text>

                    {budget > 0 && (
                        <Text
                            style={{
                                fontSize: 13,
                                marginTop: 2,
                                color:
                                    Number(percentUsed) > 90
                                        ? theme.danger
                                        : theme.success,
                            }}
                        >
                            {percentUsed}% used
                        </Text>
                    )}
                </TouchableOpacity>

                <View>
                    <Text style={[styles.smallText, { color: theme.textLight }]}>
                        Last month
                    </Text>
                    <Text style={[styles.valueText, { color: theme.textDark }]}>
                        ₹
                        {prevMonthTx
                            .filter(tx => tx.type === 'debit')
                            .reduce((s, tx) => s + tx.amount, 0)}
                    </Text>
                </View>
            </View>

            {/* GRAPH CARD */}
            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Text style={[styles.sectionTitle, { color: theme.textDark }]}>
                    {isDaily ? 'Daily Spends Overview' : 'Monthly Spends Overview'}
                </Text>

                {/* DAILY CHART */}
                {isDaily ? (
                    <LineChart
                        data={{
                            labels: visibleLabels,
                            datasets: [
                                {
                                    data: visibleData,
                                    color: () => '#e63946',
                                    strokeWidth: 2,
                                },
                                // Budget line
                                ...(budget > 0
                                    ? [
                                        {
                                            data: Array(visibleData.length).fill(budget),
                                            color: () => theme.success,
                                            strokeWidth: 2,
                                            withDots: false,
                                        },
                                    ]
                                    : []),
                            ],
                        }}
                        width={screenWidth - 60}
                        height={250}
                        yAxisLabel="₹"
                        formatYLabel={v => formatYAxis(Number(v))}
                        chartConfig={chartConfig}
                        fromZero
                        withInnerLines
                        bezier
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
                        yAxisSuffix=""
                        chartConfig={{
                            ...chartConfig,
                            barPercentage: 0.55,
                            color: () => '#e63946',
                        }}
                        fromZero
                        showValuesOnTopOfBars={false}
                        style={{ borderRadius: 12 }}
                    />
                )}
                {/* TOGGLE BUTTONS */}
                <View style={styles.toggleRow}>
                    <TouchableOpacity
                        onPress={() => setIsDaily(true)}
                        style={[
                            styles.toggleBtn,
                            isDaily && { backgroundColor: theme.primary },
                        ]}
                    >
                        <Text style={{ color: isDaily ? '#fff' : theme.textDark }}>
                            Daily
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setIsDaily(false)}
                        style={[
                            styles.toggleBtn,
                            !isDaily && { backgroundColor: theme.primary },
                        ]}
                    >
                        <Text style={{ color: !isDaily ? '#fff' : theme.textDark }}>
                            Monthly
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* MODAL */}
            <BudgetModal
                visible={showBudgetModal}
                budget={budget}
                tempBudget={tempBudget}
                setTempBudget={setTempBudget}
                onCancel={() => setShowBudgetModal(false)}
                onSave={async newBudget => {
                    await saveBudget(newBudget);
                    setBudget(newBudget);
                    setShowBudgetModal(false);
                }}
            />
        </>
    );
}

const styles = StyleSheet.create({
    comparisonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    smallText: { fontSize: 13 },
    valueText: { fontSize: 16, fontWeight: '700' },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginTop: 16,
    },
    toggleBtn: {
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#ccc',
    },
});
