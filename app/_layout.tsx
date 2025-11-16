// app/_layout.tsx
import { ThemeProvider } from '../contexts/ThemeContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/contexts/ThemeContext';
import { View } from 'react-native';
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
        }}
      >
        {/* ✅ Tabs root — hide header */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* ✅ Transactions, Insights, etc. */}
        <Stack.Screen
          name="transactions/index"
          options={{
            title: 'Personal Cashbook', // ✅ Fixed title
          }}
        />
        <Stack.Screen
          name="insights/index"
          options={{
            title: 'Personal Cashbook', // ✅ Fixed title
          }}
        />
        <Stack.Screen
          name="investments/index"
          options={{
            title: 'Personal Cashbook', // ✅ Fixed title
          }}
        />
        <Stack.Screen
          name="trips/index"
          options={{
            title: 'Personal Cashbook', // ✅ Fixed title
          }}
        />
        <Stack.Screen
          name="settings/index"
          options={{
            title: 'Personal Cashbook', // ✅ Fixed title
          }}
        />
        <Stack.Screen
          name="sms/index"
          options={{
            title: 'Personal Cashbook', // ✅ Fixed title
          }}
        />
      </Stack>
    </View>
  );
}
