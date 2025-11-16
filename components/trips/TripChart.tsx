// components/trips/TripChart.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Trip } from '@/hooks/useTrips';
import { useTheme } from '@/contexts/ThemeContext';

const screenWidth = Dimensions.get('window').width - 24;

type Props = {
    trips: Trip[];
};

export default function TripChart({ trips }: Props) {
    const { theme } = useTheme();

    const chartData = useMemo(() => {
        const sorted = [...trips].sort(
            (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );

        const labels = sorted.map((t, i) => `#${i + 1}`);
        const mileageData = sorted.map((t) => (t.mileage ? t.mileage : 0));
        const distanceData = sorted.map((t) => (t.distance ? t.distance : 0));
        const costData = sorted.map((t) => (t.cost ? t.cost : 0));

        return { labels, mileageData, distanceData, costData };
    }, [trips]);

    if (trips.length === 0) {
        return (
            <View style={styles.empty}>
                <Text style={{ color: theme.textLight }}>No trips yet — add some to see insights!</Text>
            </View>
        );
    }

    const chartConfig = {
        backgroundColor: theme.card,
        backgroundGradientFrom: theme.card,
        backgroundGradientTo: theme.card,
        decimalPlaces: 1,
        color: (opacity = 1) => theme.primary,
        labelColor: (opacity = 1) =>
            theme.name === "dark"
                ? `rgba(255,255,255,${opacity})`
                : theme.textLight,
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: theme.primary,
        },
        propsForBackgroundLines: {
            stroke: theme.border,
            strokeDasharray: "4",
        },
    };


    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
            <Text style={[styles.header, { color: theme.textDark }]}>Trip Insights</Text>

            <Text style={[styles.title, { color: theme.textDark }]}>Mileage Trend (km/L)</Text>
            <LineChart
                data={{
                    labels: chartData.labels,
                    datasets: [{ data: chartData.mileageData }],
                }}
                width={screenWidth}
                height={240}
                yAxisSuffix=""
                yAxisLabel=""
                fromZero
                chartConfig={chartConfig}
                bezier
                style={{
                    ...styles.chart,
                    backgroundColor: theme.card,
                }}
            />

            <Text style={[styles.title, { color: theme.textDark }]}>Distance Per Trip (km)</Text>
            <BarChart
                data={{
                    labels: chartData.labels,
                    datasets: [{ data: chartData.distanceData }],
                }}
                width={screenWidth}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero
                chartConfig={chartConfig}
                style={{
                    ...styles.chart,
                    backgroundColor: theme.card,
                }}
            />

            <Text style={[styles.title, { color: theme.textDark }]}>Cost Per Trip (₹)</Text>
            <BarChart
                data={{
                    labels: chartData.labels,
                    datasets: [{ data: chartData.costData }],
                }}
                width={screenWidth}
                height={220}
                fromZero
                yAxisLabel=""
                yAxisSuffix="₹"
                chartConfig={chartConfig}
                style={{
                    ...styles.chart,
                    backgroundColor: theme.card,
                }}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 12,
    },
    header: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 12,
        marginBottom: 8,
        textAlign: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    chart: {
        borderRadius: 12,
        marginLeft: 6,
        marginBottom: 6,
    },
    empty: {
        padding: 20,
        alignItems: 'center',
    },
});
