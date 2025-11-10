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
        {/* Tabs root — hide header here */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Other stack screens show header normally */}
        <Stack.Screen
          name="transactions/index"
          options={({ route }) => ({
            title: (route.params as { bookName?: string })?.bookName || 'Transactions',
          })}
        />

        <Stack.Screen
          name="insights/index"
          options={({ route }) => ({
            title: (route.params as { bookName?: string })?.bookName || 'Insights',
          })}
        />
      </Stack>
    </View>
  );
}
