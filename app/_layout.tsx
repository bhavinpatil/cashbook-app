// app/_layout.tsx
import { ThemeProvider } from '../contexts/ThemeContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/contexts/ThemeContext';
import { View, Text } from 'react-native';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppLayout />
    </ThemeProvider>
  );
}

function AppLayout() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={theme.name === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.card },
          headerTintColor: theme.textDark,
          contentStyle: { backgroundColor: theme.background },
          headerTitle: () => (
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: theme.textDark,
              }}
            >
              📘 Personal Cashbook
            </Text>
          ),
          headerTitleAlign: 'center',
        }}
      >
        {/* Tabs root — hide header */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* These screens now use the same global title */}
        <Stack.Screen name="transactions/index" />
        <Stack.Screen name="insights/index" />
        <Stack.Screen name="investments/index" />
      </Stack>
    </View>
  );
}
