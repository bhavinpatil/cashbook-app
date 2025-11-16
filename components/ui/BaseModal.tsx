// components/ui/BaseModal.tsx
import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { RADIUS, SPACING, SHADOW } from '@/constants/design';
import { H3 } from './Typography';

interface Props {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxHeightPercent?: number; // 0..100
}

export default function BaseModal({
  visible,
  title,
  onClose,
  children,
  maxHeightPercent = 85,
}: Props) {
  const { theme } = useTheme();

  return (
    <Modal animationType="fade" transparent visible={visible} statusBarTranslucent>
      <SafeAreaView style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, borderRadius: RADIUS.lg, width: '94%', maxHeight: `${maxHeightPercent}%`, ...SHADOW.medium }]}>

          {/* HEADER */}
          <View style={styles.header}>
            {title ? <H3>{title}</H3> : <View />}
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.textLight} />
            </TouchableOpacity>
          </View>

          {/* BODY */}
          <View style={[styles.body]}>
            {children}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6,10,15,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  card: {
    width: '94%',
    borderWidth: 1,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    flexGrow: 1,
  },
});
