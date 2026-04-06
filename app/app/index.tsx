import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSettings } from "../src/hooks/useSettings";
import { formatServerTarget } from "../src/lib/serverEndpoint";

export default function HomeScreen() {
  const router = useRouter();
  const { settings, loading } = useSettings();

  if (loading || !settings) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  const canStart = !!settings.serverIp.trim();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>osu! tablet</Text>
      <Text style={styles.subtitle}>iPad as absolute positioning input</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Server</Text>
        <Text style={styles.value}>
          {formatServerTarget(settings.serverIp, settings.serverPort)}
        </Text>

        <Text style={[styles.label, { marginTop: 12 }]}>Monitor</Text>
        <Text style={styles.value}>
          {settings.monitorWidth} x {settings.monitorHeight}
        </Text>

        <Text style={[styles.label, { marginTop: 12 }]}>Tap Action</Text>
        <Text style={styles.value}>{settings.tapAction}</Text>
      </View>

      <View style={styles.buttons}>
        <Pressable
          style={[styles.btn, styles.btnPrimary, !canStart && styles.btnDisabled]}
          onPress={() => router.push("/tablet")}
          disabled={!canStart}
        >
          <Text style={styles.btnText}>Start</Text>
        </Pressable>

        <Pressable
          style={[styles.btn, styles.btnSecondary]}
          onPress={() => router.push("/settings")}
        >
          <Text style={styles.btnText}>Settings</Text>
        </Pressable>
      </View>

      {!canStart && (
        <Text style={styles.hint}>Set a server host or websocket URL in Settings to begin</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#e0e0e0",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginBottom: 40,
  },
  infoBox: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    marginBottom: 32,
  },
  label: {
    fontSize: 12,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  value: {
    fontSize: 18,
    color: "#e0e0e0",
    marginTop: 2,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  btn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  btnPrimary: {
    backgroundColor: "#e84393",
  },
  btnSecondary: {
    backgroundColor: "#2d3436",
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    color: "#888",
    fontSize: 14,
    marginTop: 16,
  },
  text: {
    color: "#e0e0e0",
  },
});
