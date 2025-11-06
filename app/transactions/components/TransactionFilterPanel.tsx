import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

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
  const [sortBy, setSortBy] = useState<string | undefined>(initialFilters?.sortBy);
  const [type, setType] = useState<string | undefined>(initialFilters?.type);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters?.categories || []);

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
    onApply({
      sortBy,
      type,
      categories: selectedCategories,
    });
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
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 20,
            maxHeight: '80%',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="black" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 16 }}>
            {/* Type Filter */}
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>Transaction Type</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              {['all', 'credit', 'debit'].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 20,
                    backgroundColor: type === t ? COLORS.primary : COLORS.gray2,
                  }}
                >
                  <Text style={{ color: type === t ? 'white' : 'black' }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort Filter */}
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>Sort By</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {['newest', 'oldest', 'highest', 'lowest'].map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setSortBy(s)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 20,
                    backgroundColor: sortBy === s ? COLORS.primary : COLORS.gray2,
                  }}
                >
                  <Text style={{ color: sortBy === s ? 'white' : 'black' }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Filter */}
            {categories.length > 0 && (
              <>
                <Text style={{ fontWeight: '600', marginBottom: 8 }}>Categories</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => toggleCategory(cat)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 14,
                        borderRadius: 20,
                        backgroundColor: selectedCategories.includes(cat)
                          ? COLORS.primary
                          : COLORS.gray2,
                      }}
                    >
                      <Text
                        style={{
                          color: selectedCategories.includes(cat) ? 'white' : 'black',
                        }}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 , marginBottom: 40}}>
            <TouchableOpacity
              onPress={handleReset}
              style={{
                flex: 1,
                backgroundColor: COLORS.gray2,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              style={{
                flex: 1,
                backgroundColor: COLORS.primary,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
