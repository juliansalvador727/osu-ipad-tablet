import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSettings } from "../src/hooks/useSettings";
import { AppSettings, TapAction } from "../src/types/settings";

const TAP_OPTIONS: { label: string; value: TapAction }[] = [
  { label: "Z key", value: "key_z" },
  { label: "X key", value: "key_x" },
  { label: "Mouse click", value: "mouse_left" },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, loading, saveSettings } = useSettings();
  const [form, setForm] = useState<AppSettings | null>(null);

  useEffect(() => {
    if (settings) setForm({ ...settings });
  }, [settings]);

  if (loading || !form) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  const update = (key: keyof AppSettings, value: string | number) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const updateArea = (key: keyof AppSettings["activeArea"], value: string) => {
    const num = parseInt(value, 10) || 0;
    setForm((prev) =>
      prev ? { ...prev, activeArea: { ...prev.activeArea, [key]: num } } : prev
    );
  };

  const handleSave = async () => {
    if (form) {
      await saveSettings(form);
      router.back();
    }
  };

  const resetActiveArea = () => {
    setForm((prev) =>
      prev ? { ...prev, activeArea: { x: 0, y: 0, width: 0, height: 0 } } : prev
    );
  };

  const screen = Dimensions.get("window");

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.section}>Connection</Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Server Host / URL</Text>
          <TextInput
            style={styles.input}
            value={form.serverIp}
            onChangeText={(v) => update("serverIp", v)}
            placeholder="wss://example.ngrok.app"
            placeholderTextColor="#555"
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.fieldHint}>
            Supports `host`, `host:port`, `ws://...`, or `wss://...`
          </Text>
        </View>
        <View style={[styles.field, { maxWidth: 100 }]}>
          <Text style={styles.label}>Port</Text>
          <TextInput
            style={styles.input}
            value={String(form.serverPort)}
            onChangeText={(v) => update("serverPort", parseInt(v, 10) || 0)}
            keyboardType="number-pad"
          />
          <Text style={styles.fieldHint}>Used only when the host field has no port</Text>
        </View>
      </View>

      <Text style={styles.section}>Monitor Resolution</Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Width</Text>
          <TextInput
            style={styles.input}
            value={String(form.monitorWidth)}
            onChangeText={(v) => update("monitorWidth", parseInt(v, 10) || 0)}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Height</Text>
          <TextInput
            style={styles.input}
            value={String(form.monitorHeight)}
            onChangeText={(v) => update("monitorHeight", parseInt(v, 10) || 0)}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <Text style={styles.section}>
        Active Area{" "}
        <Text style={styles.hint}>
          (0 = full screen: {Math.round(screen.width)} x {Math.round(screen.height)})
        </Text>
      </Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>X offset</Text>
          <TextInput
            style={styles.input}
            value={String(form.activeArea.x)}
            onChangeText={(v) => updateArea("x", v)}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Y offset</Text>
          <TextInput
            style={styles.input}
            value={String(form.activeArea.y)}
            onChangeText={(v) => updateArea("y", v)}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Width</Text>
          <TextInput
            style={styles.input}
            value={String(form.activeArea.width)}
            onChangeText={(v) => updateArea("width", v)}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Height</Text>
          <TextInput
            style={styles.input}
            value={String(form.activeArea.height)}
            onChangeText={(v) => updateArea("height", v)}
            keyboardType="number-pad"
          />
        </View>
      </View>
      <Pressable style={styles.linkBtn} onPress={resetActiveArea}>
        <Text style={styles.linkText}>Reset to full screen</Text>
      </Pressable>

      <Text style={styles.section}>Tap Action</Text>
      <View style={styles.row}>
        {TAP_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[
              styles.chip,
              form.tapAction === opt.value && styles.chipActive,
            ]}
            onPress={() => setForm((prev) => prev ? { ...prev, tapAction: opt.value } : prev)}
          >
            <Text
              style={[
                styles.chipText,
                form.tapAction === opt.value && styles.chipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  text: {
    color: "#e0e0e0",
    fontSize: 16,
  },
  section: {
    fontSize: 14,
    color: "#e84393",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: "#666",
    textTransform: "none",
    letterSpacing: 0,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  field: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  fieldHint: {
    color: "#666",
    fontSize: 11,
    marginTop: 6,
  },
  input: {
    backgroundColor: "#16213e",
    color: "#e0e0e0",
    fontSize: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#2d3436",
  },
  linkBtn: {
    marginTop: 8,
  },
  linkText: {
    color: "#74b9ff",
    fontSize: 14,
  },
  chip: {
    backgroundColor: "#16213e",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2d3436",
  },
  chipActive: {
    borderColor: "#e84393",
    backgroundColor: "#2d1a2e",
  },
  chipText: {
    color: "#888",
    fontSize: 14,
  },
  chipTextActive: {
    color: "#e84393",
  },
  saveBtn: {
    backgroundColor: "#e84393",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 32,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
