import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="businesses" options={{ title: "Businesses" }} />
      <Tabs.Screen name="books" options={{ title: "Books" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
