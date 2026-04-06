import { Stack } from "expo-router";
import { SettingsProvider } from "../src/providers/SettingsProvider";

export default function RootLayout() {
  return (
    <SettingsProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1a1a2e" },
          headerTintColor: "#e0e0e0",
          contentStyle: { backgroundColor: "#1a1a2e" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "osu! tablet" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
        <Stack.Screen name="calibrate" options={{ title: "Calibration" }} />
        <Stack.Screen name="tablet" options={{ headerShown: false }} />
      </Stack>
    </SettingsProvider>
  );
}
