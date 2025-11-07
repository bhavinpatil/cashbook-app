// components/BusinessSection.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import CustomEditButton from '../../../components/CustomEditButton';
import CustomButton from '../../../components/CustomButton';
import { useTheme } from '../../../contexts/ThemeContext';

interface Business {
  id: string;
  name: string;
}

interface Props {
  businesses: Business[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function BusinessSection({ businesses, onAdd, onEdit, onDelete }: Props) {
  const { theme } = useTheme();

  const renderItem = ({ item }: { item: Business }) => (
    <View style={[styles.item, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.itemTitle, { color: theme.textDark }]}>{item.name}</Text>
      <View style={styles.actions}>
        <CustomEditButton title="Edit" type="edit" onPress={() => onEdit(item.id)} />
        <CustomEditButton title="Delete" type="delete" onPress={() => onDelete(item.id)} />
      </View>
    </View>
  );

  return (
    <View style={{ marginBottom: 30 }}>
      <Text style={[styles.sectionTitle, { color: theme.textDark }]}>Businesses</Text>
      <FlatList
        data={businesses}
        renderItem={renderItem}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.textLight }]}>No businesses yet</Text>
        }
      />
      <CustomButton title="＋ Add Business" onPress={onAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  item: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  empty: { textAlign: 'center', fontStyle: 'italic', marginVertical: 10 },
});
