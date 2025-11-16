// components/settings/SettingsGridItem.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface GridItemProps {
    title: string;
    icon: string;
    onPress: () => void;
}

const SettingsGridItem: React.FC<GridItemProps> = ({ title, icon, onPress }) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            activeOpacity={0.8}
            onPress={onPress}
        >
            <View style={[styles.iconWrapper, { backgroundColor: theme.primary + '22' }]}>
                <Ionicons name={icon as any} size={24} color={theme.primary} />
            </View>

            <Text style={[styles.title, { color: theme.textDark }]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '48%',
        borderWidth: 1,
        borderRadius: 16,
        padding: 18,
        marginBottom: 18,
    },
    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
    },
});
