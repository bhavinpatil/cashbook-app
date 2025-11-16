// app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to your default tab (like Businesses)
  return <Redirect href="/(tabs)/books" />;
}
