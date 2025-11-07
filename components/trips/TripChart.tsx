import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Trip } from '@/hooks/useTrips';

const screenWidth = Dimensions.get('window').width - 24;

type Props = {
    trips: Trip[];
};

export default function TripChart({ trips }: Props) {
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
                <Text style={{ color: '#777' }}>No trips yet — add some to see insights!</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
            <Text style={styles.header}>Trip Insights</Text>

            {/* Mileage Trend */}
            <Text style={styles.title}>Mileage Trend (km/L)</Text>
            <LineChart
                data={{
                    labels: chartData.labels,
                    datasets: [{ data: chartData.mileageData }],
                }}
                width={screenWidth}
                height={240}
                yAxisSuffix=" km/L"
                yAxisLabel=""
                fromZero
                chartConfig={{
                    ...chartConfig,
                    propsForLabels: {
                        fontSize: 11,
                    },
                }}
                bezier
                style={styles.chart}
            />


            {/* Distance Per Trip */}
            <Text style={styles.title}>Distance Per Trip (km)</Text>
            <BarChart
                data={{
                    labels: chartData.labels,
                    datasets: [{ data: chartData.distanceData }],
                }}
                width={screenWidth}
                height={220}
                yAxisLabel=""
                yAxisSuffix=" km"
                fromZero
                chartConfig={chartConfig}
                style={styles.chart}
            />

            {/* Cost Per Trip */}
            <Text style={styles.title}>Cost Per Trip (₹)</Text>
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
                style={styles.chart}
            />
        </ScrollView>
    );
}

const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#f9f9f9',
    backgroundGradientTo: '#f9f9f9',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(47, 149, 220, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
    style: { borderRadius: 12 },
    propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: '#2f95dc',
    },
};

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
        marginBottom: 4,
    },
    chart: {
        borderRadius: 12,
        marginLeft: 10,   // ✅ add directly here
    },
    empty: {
        padding: 20,
        alignItems: 'center',
    },
});
