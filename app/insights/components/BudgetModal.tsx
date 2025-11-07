// app/insights/components/BudgetModal.tsx

import React from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface BudgetModalProps {
  visible: boolean;
  budget: number;
  tempBudget: string;
  setTempBudget: (val: string) => void;
  onCancel: () => void;
  onSave: (newBudget: number) => void;
}

export default function BudgetModal({
  visible,
  budget,
  tempBudget,
  setTempBudget,
  onCancel,
  onSave,
}: BudgetModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Update Monthly Budget</Text>
          <TextInput
            style={styles.input}
            value={tempBudget}
            keyboardType="numeric"
            onChangeText={setTempBudget}
            placeholder="Enter new budget"
          />
          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.modalButton, { backgroundColor: '#ccc' }]}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onSave(Number(tempBudget))}
              style={[styles.modalButton, { backgroundColor: '#2a9d8f' }]}
            >
              <Text style={{ color: '#fff' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
});
