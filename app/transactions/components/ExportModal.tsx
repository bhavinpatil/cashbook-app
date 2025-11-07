import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants/theme';
import { Transaction } from '../types';
import { useExport } from '../hooks/useExport';

interface ExportModalProps {
    visible: boolean;
    onClose: () => void;
    transactions: Transaction[];
    bookName: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ visible, onClose, transactions, bookName }) => {
    const { exportToExcel, exportToCSV, shareFile } = useExport();
    const [loading, setLoading] = useState(false);

    const handleExport = async (type: 'excel' | 'csv' | 'pdf') => {
        setLoading(true);
        try {
            let fileUri = '';
            if (type === 'excel') fileUri = await exportToExcel(transactions, bookName);
            if (type === 'csv') fileUri = await exportToCSV(transactions, bookName);
            //   if (type === 'pdf') fileUri = await exportToPDF(transactions, bookName);
            await shareFile(fileUri);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setLoading(false);
            onClose();
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.title}>Export {bookName}</Text>

                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
                    ) : (
                        <>
                            <TouchableOpacity style={styles.button} onPress={() => handleExport('excel')}>
                                <Text style={styles.buttonText}>Excel (.xlsx)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.button} onPress={() => handleExport('csv')}>
                                <Text style={styles.buttonText}>CSV (.csv)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.button} onPress={() => handleExport('pdf')}>
                                <Text style={styles.buttonText}>PDF</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
                                <Text style={[styles.buttonText, { color: COLORS.danger }]}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default ExportModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: 'white',
        width: '85%',
        borderRadius: 12,
        padding: 20,
        elevation: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    cancel: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: COLORS.danger,
    },
});
function shareFile(fileUri: string) {
    throw new Error('Function not implemented.');
}

