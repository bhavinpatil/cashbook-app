// app/transactions/components/TransactionFilterPanel.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, GLOBAL_STYLES } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface FilterOptions {
    type: 'all' | 'credit' | 'debit';
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
}

interface Props {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: FilterOptions) => void;
    onReset: () => void;
    initialFilters?: FilterOptions;
}

export default function TransactionFilterPanel({
    visible,
    onClose,
    onApply,
    onReset,
    initialFilters,
}: Props) {
    const [type, setType] = useState<FilterOptions['type']>(initialFilters?.type || 'all');
    const [startDate, setStartDate] = useState<Date | undefined>(initialFilters?.startDate);
    const [endDate, setEndDate] = useState<Date | undefined>(initialFilters?.endDate);
    const [minAmount, setMinAmount] = useState<string>(
        initialFilters?.minAmount?.toString() || ''
    );
    const [maxAmount, setMaxAmount] = useState<string>(
        initialFilters?.maxAmount?.toString() || ''
    );
    const [sortBy, setSortBy] = useState<FilterOptions['sortBy']>(
        initialFilters?.sortBy || 'newest'
    );

    const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

    const handleApply = () => {
        onApply({
            type,
            startDate,
            endDate,
            minAmount: minAmount ? Number(minAmount) : undefined,
            maxAmount: maxAmount ? Number(maxAmount) : undefined,
            sortBy,
        });
        onClose();
    };

    const handleReset = () => {
        setType('all');
        setStartDate(undefined);
        setEndDate(undefined);
        setMinAmount('');
        setMaxAmount('');
        setSortBy('newest');
        onReset();
    };

    const onChangeDate = (_: any, selectedDate?: Date) => {
        if (!selectedDate) {
            setShowPicker(null);
            return;
        }
        if (showPicker === 'start') setStartDate(selectedDate);
        if (showPicker === 'end') setEndDate(selectedDate);
        if (Platform.OS !== 'ios') setShowPicker(null);
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.panel}>
                    <Text style={GLOBAL_STYLES.title}>Filter Transactions</Text>

                    {/* Transaction Type */}
                    <View style={{ flexDirection: 'row', marginVertical: 10, justifyContent: 'center' }}>
                        {(['all', 'credit', 'debit'] as FilterOptions['type'][]).map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[
                                    styles.typeButton,
                                    {
                                        backgroundColor:
                                            type === t
                                                ? t === 'credit'
                                                    ? COLORS.success
                                                    : t === 'debit'
                                                        ? COLORS.danger
                                                        : COLORS.primary
                                                : 'transparent',
                                    },
                                ]}
                                onPress={() => setType(t)}
                            >
                                <Text
                                    style={{
                                        color: type === t ? 'white' : COLORS.textDark,
                                        fontWeight: '500',
                                    }}
                                >
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Date Range */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}>
                        <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker('start')}>
                            <Text>Start: {startDate ? startDate.toLocaleDateString() : '--/--/----'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker('end')}>
                            <Text>End: {endDate ? endDate.toLocaleDateString() : '--/--/----'}</Text>
                        </TouchableOpacity>
                    </View>

                    {showPicker && (
                        <DateTimePicker
                            value={showPicker === 'start' ? startDate || new Date() : endDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={onChangeDate}
                        />
                    )}

                    {/* Amount Range */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}>
                        <TextInput
                            placeholder="Min Amount"
                            keyboardType="numeric"
                            style={styles.amountInput}
                            value={minAmount}
                            onChangeText={setMinAmount}
                        />
                        <TextInput
                            placeholder="Max Amount"
                            keyboardType="numeric"
                            style={styles.amountInput}
                            value={maxAmount}
                            onChangeText={setMaxAmount}
                        />
                    </View>

                    {/* Sort By */}
                    <View style={{ marginVertical: 10 }}>
                        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Sort By:</Text>
                        {(['newest', 'oldest', 'highest', 'lowest'] as const).map((s) => {
                            if (!s) return null; // optional guard
                            return (
                                <TouchableOpacity
                                    key={s}
                                    style={styles.sortOption}
                                    onPress={() => setSortBy(s)}
                                >
                                    <Ionicons
                                        name={sortBy === s ? 'radio-button-on' : 'radio-button-off'}
                                        size={20}
                                        color={COLORS.primary}
                                    />
                                    <Text style={{ marginLeft: 8, fontSize: 16 }}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
                                </TouchableOpacity>
                            );
                        })}

                    </View>

                    {/* Buttons */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                            <Text style={{ color: 'white', fontWeight: '600' }}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    panel: {
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
    },
    typeButton: {
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    dateInput: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    amountInput: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    applyButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    resetButton: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
});
