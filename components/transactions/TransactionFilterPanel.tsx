import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  onReset: () => void;
  initialFilters: any;
  categories: string[];
}

export default function TransactionFilterPanel({
  visible,
  onClose,
  onApply,
  onReset,
  initialFilters,
  categories,
}: Props) {
  const { theme } = useTheme();
  const [sortBy, setSortBy] = useState<string | undefined>(initialFilters?.sortBy);
  const [type, setType] = useState<string | undefined>(initialFilters?.type);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters?.categories || []
  );

  useEffect(() => {
    setSortBy(initialFilters?.sortBy);
    setType(initialFilters?.type);
    setSelectedCategories(initialFilters?.categories || []);
  }, [initialFilters]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleApply = () => {
    onApply({ sortBy, type, categories: selectedCategories });
    onClose();
  };

  const handleReset = () => {
    setSortBy(undefined);
    setType(undefined);
    setSelectedCategories([]);
    onReset();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.overlay]}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textDark }]}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.textDark} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Type Filter */}
            <FilterSection title="Transaction Type" theme={theme}>
              {['all', 'credit', 'debit'].map((t) => (
                <FilterChip
                  key={t}
                  label={t}
                  selected={type === t}
                  onPress={() => setType(t)}
                  theme={theme}
                />
              ))}
            </FilterSection>

            {/* Sort Filter */}
            <FilterSection title="Sort By" theme={theme}>
              {['newest', 'oldest', 'highest', 'lowest'].map((s) => (
                <FilterChip
                  key={s}
                  label={s}
                  selected={sortBy === s}
                  onPress={() => setSortBy(s)}
                  theme={theme}
                />
              ))}
            </FilterSection>

            {/* Categories */}
            {categories.length > 0 && (
              <FilterSection title="Categories" theme={theme}>
                {categories.map((cat) => (
                  <FilterChip
                    key={cat}
                    label={cat}
                    selected={selectedCategories.includes(cat)}
                    onPress={() => toggleCategory(cat)}
                    theme={theme}
                  />
                ))}
              </FilterSection>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={handleReset}
              style={[
                styles.actionButton,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.actionText, { color: theme.textDark }]}>
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              style={[
                styles.actionButton,
                { backgroundColor: theme.primary },
              ]}
            >
              <Text style={[styles.actionText, { color: '#fff' }]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ---------------------- Helper Components ---------------------- */

const FilterSection = ({
  title,
  children,
  theme,
}: {
  title: string;
  children: React.ReactNode;
  theme: any;
}) => (
  <View style={{ marginBottom: 20 }}>
    <Text
      style={{
        fontWeight: '600',
        fontSize: 15,
        marginBottom: 8,
        color: theme.textLight,
      }}
    >
      {title}
    </Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {children}
    </View>
  </View>
);

const FilterChip = ({
  label,
  selected,
  onPress,
  theme,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: any;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 20,
      backgroundColor: selected
        ? theme.primary
        : theme.name === 'dark'
        ? theme.border
        : theme.card,
      borderWidth: selected ? 0 : 1,
      borderColor: selected ? theme.primary : theme.border,
      shadowColor: selected ? theme.primary : '#000',
      shadowOpacity: selected ? 0.3 : 0.05,
      shadowRadius: 3,
      elevation: selected ? 3 : 1,
    }}
  >
    <Text
      style={{
        color: selected ? '#fff' : theme.textDark,
        fontWeight: selected ? '600' : '400',
        textTransform: 'capitalize',
      }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
    paddingBottom: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
