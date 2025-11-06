// app/_layout.tsx

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack> */}


      <Stack>
        {/* Tabs root (no header) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />


        {/* Add dynamic header for Businesses screen */}
        <Stack.Screen
          name="(tabs)/businesses"
          options={{ title: 'Businesses' }}
        />


        {/* Add dynamic header for Books of a specific business */}
        <Stack.Screen
          name="businesses/[businessId]/books"
          options={({ route }) => ({
            title: (route.params as { businessName?: string })?.businessName || 'Books',
          })}
        />


        {/* Add dynamic header for Transactions of a specific book */}
        <Stack.Screen
          name="transactions/index"
          options={({ route }) => ({
            title: (route.params as { bookName?: string })?.bookName || 'Transactions',
          })}
        />


        {/* Any modal screens */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
