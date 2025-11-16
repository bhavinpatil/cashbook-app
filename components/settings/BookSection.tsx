// components/settings/BookSection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomButton from '@/components/CustomButton';
import CustomEditButton from '@/components/CustomEditButton';
import { useTheme } from '@/contexts/ThemeContext';
import { Book } from '@/types/types';

interface Props {
  books: Book[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function BookSection({ books, onAdd, onEdit, onDelete }: Props) {
  const { theme } = useTheme();

  return (
    <View>
      {books.length === 0 && (
        <Text style={[styles.empty, { color: theme.textLight }]}>No books added yet</Text>
      )}

      {books.map((item) => (
        <View
          key={item.id}
          style={[styles.item, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <Text style={[styles.itemTitle, { color: theme.textDark }]}>{item.name}</Text>
          <Text style={[styles.itemSub, { color: theme.textLight }]}>
            🏢 {item.businessName}
          </Text>

          <View style={styles.actions}>
            <CustomEditButton title="Edit" type="edit" onPress={() => onEdit(item.id)} />
            <CustomEditButton title="Delete" type="delete" onPress={() => onDelete(item.id)} />
          </View>
        </View>
      ))}

      <CustomButton title="＋ Add Book" onPress={onAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  itemSub: { fontSize: 13, marginBottom: 6 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  empty: { textAlign: 'center', marginBottom: 10, fontStyle: 'italic' },
});
