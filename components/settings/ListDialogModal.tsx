// components/settings/ListDialogModal.tsx
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
    visible: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export default function ListDialogModal({ visible, title, onClose, children }: Props) {
    const { theme } = useTheme();

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: theme.border }]}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.textDark }]}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={22} color={theme.textLight} />
                        </TouchableOpacity>
                    </View>

                    {/* Content AREA — do not wrap in ScrollView. FlatList inside will scroll */}
                    <View style={styles.contentArea}>
                        {children}
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalBox: {
        width: '90%',        // CONSTRAIN width so it centers properly
        maxHeight: '78%',    // allow list inside to scroll
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    contentArea: {
        flex: 1,          // allow the FlatList inside to take full height
        width: '100%',
    },
});
