// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerTitle: 'Personal Cashbook', // ✅ global header title
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.textDark,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        tabBarStyle: { backgroundColor: theme.card },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textLight,
      }}
    >
      {/* <Tabs.Screen
        name="businesses"
        options={{
          title: 'Businesses',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" color={color} size={size} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="books"
        options={{
          title: 'Books',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips Log',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bicycle-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="layers-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
