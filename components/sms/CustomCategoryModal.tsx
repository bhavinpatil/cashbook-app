// components/sms/CustomCategoryModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function CustomCategoryModal({
  visible,
  onClose,
  onSave,
  initial = '',
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (category: string) => void;
  initial?: string;
}) {
  const { theme } = useTheme();
  const [value, setValue] = useState(initial);

  useEffect(() => {
    if (visible) setValue(initial || '');
  }, [visible, initial]);

  const save = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      // small guard - could also show toast
      return;
    }
    onSave(trimmed);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.textDark }]}>Add Custom Category</Text>

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Enter category name"
            placeholderTextColor={theme.textLight}
            style={[styles.input, { color: theme.textDark, borderColor: theme.border }]}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={save}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, { borderColor: theme.border }]} onPress={onClose}>
              <Text style={{ color: theme.textDark, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: theme.primary }]} onPress={save}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.35)' },
  card: { width: '92%', borderRadius: 12, padding: 14, borderWidth: 1 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 15, marginBottom: 12 },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center', marginRight: 8 },
  btnPrimary: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginLeft: 8 },
});
