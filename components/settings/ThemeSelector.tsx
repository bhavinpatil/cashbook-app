// components/settings/ThemeSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const THEME_OPTIONS = ['light', 'dark', 'blue', 'green'] as const;

export default function ThemeSelector() {
  const { theme, setThemeByName } = useTheme();

  return (
    <View style={{ marginTop: 30 }}>
      <Text style={[styles.title, { color: theme.textDark }]}>App Theme</Text>

      <View style={styles.buttonGroup}>
        {THEME_OPTIONS.map((option) => {
          const isActive = theme.name === option;
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                {
                  backgroundColor: isActive ? theme.primary : theme.card,
                  borderColor: isActive ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setThemeByName(option)}
              activeOpacity={0.85}
            >
              <Text
                style={{
                  color: isActive ? '#fff' : theme.textDark,
                  fontWeight: isActive ? '700' : '500',
                }}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
