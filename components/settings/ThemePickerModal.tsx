import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

// Explicitly type the supported theme names
export type ThemeName = 'light' | 'dark' | 'blue' | 'green';

const THEME_OPTIONS: ThemeName[] = ['light', 'dark', 'blue', 'green'];

interface ThemePickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ThemePickerModal({ visible, onClose }: ThemePickerModalProps) {
  const { theme, setThemeByName } = useTheme();

  const handleSelect = (name: ThemeName) => {
    setThemeByName(name); // ✅ Matches the expected type
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.textDark }]}>Choose Theme</Text>

          {THEME_OPTIONS.map((option) => {
            const isActive = theme.name === option;
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  {
                    backgroundColor: isActive ? theme.primary : theme.background,
                    borderColor: isActive ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => handleSelect(option)}
              >
                <Text
                  style={{
                    color: isActive ? '#fff' : theme.textDark,
                    fontWeight: isActive ? '700' : '500',
                  }}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
                {isActive && <Ionicons name="checkmark" size={18} color="#fff" />}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={onClose}
            style={[styles.cancelBtn, { borderColor: theme.border }]}
          >
            <Text style={{ color: theme.textLight }}>Cancel</Text>
          </TouchableOpacity>
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
  },
  card: {
    width: '85%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  option: {
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  cancelBtn: {
    marginTop: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    paddingVertical: 10,
  },
});
