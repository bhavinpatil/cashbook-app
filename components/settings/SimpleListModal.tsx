// components/settings/SimpleListModal.tsx
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function SimpleListModal({ visible, title, onClose, children }: Props) {
  const { theme } = useTheme();

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={[styles.box, { backgroundColor: theme.card }]}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textDark }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.textLight} />
            </TouchableOpacity>
          </View>

          {/* CONTENT → simple ScrollView (not FlatList) */}
          <ScrollView style={{ flexGrow: 0, maxHeight: 380 }}>
            {children}
          </ScrollView>

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
  box: {
    width: '92%',
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
});
