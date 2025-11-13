// components/sms/FilterBottomSheet.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import SmsFilterPanel from '@/components/sms/SmsFilterPanel';

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
};

export default function FilterBottomSheet({ visible, onClose, onApply }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current; // 0 hidden -> 1 visible
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (visible) {
      Animated.timing(anim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    } else {
      Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    }
  }, [visible, anim]);

  // measured sheet height used to compute translateY (approximate auto-height)
  const onContentLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    setContentHeight(h);
  };

  // translateY from sheetHeight + safe area -> 0
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [contentHeight + (insets.bottom || 24) + 40, 0],
  });

  // backdrop opacity
  const backdropOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheetWrapper,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            transform: [{ translateY }],
          },
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <View
          onLayout={onContentLayout}
          style={[
            styles.sheet,
            {
              backgroundColor: theme.card,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              marginHorizontal: 14,
              paddingHorizontal: 14,
              paddingTop: 12,
              paddingBottom: 8,
              // rise above navbar slightly
              marginBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          {/* Drag handle */}
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: theme.border }]} />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={theme.textLight} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.title, { color: theme.textDark }]}>Filters</Text>

          {/* Reuse existing filter panel (it calls onApply) */}
          <SmsFilterPanel
            onApply={(f) => {
              onApply(f);
              onClose();
            }}
          />

          {/* Footer actions if you want explicit apply/cancel in the bottom sheet */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.footerBtn, { borderColor: theme.border }]}
            >
              <Text style={{ color: theme.textDark }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // If user wants to apply filters without going through panel's apply,
                // you might maintain local state here. For now we just close.
                onClose();
              }}
              style={[styles.footerBtnPrimary, { backgroundColor: theme.primary }]}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheetWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    // pointerEvents controlled via parent
  },
  sheet: {
    borderRadius: 16,
    maxHeight: '80%',
    // elevation for android
    ...Platform.select({
      android: { elevation: 8 },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 8 },
    }),
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
  },
  closeBtn: {
    position: 'absolute',
    right: 6,
    top: -2,
    padding: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'left',
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  footerBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  footerBtnPrimary: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
});
