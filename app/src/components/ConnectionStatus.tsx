import { View, Text, StyleSheet } from "react-native";
import { ConnectionStatus as Status } from "../hooks/useWebSocket";

const COLORS: Record<Status, string> = {
  disconnected: "#ff4444",
  connecting: "#ffaa00",
  connected: "#44ff44",
  error: "#ff6666",
};

interface Props {
  status: Status;
  target?: string | null;
  error?: string | null;
}

export function ConnectionStatus({ status, target, error }: Props) {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: COLORS[status] }]} />
        <Text style={styles.text}>{status}</Text>
      </View>
      {target ? <Text style={styles.meta}>{target}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    maxWidth: 220,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    color: "#ccc",
    fontSize: 12,
  },
  meta: {
    color: "#9aa0a6",
    fontSize: 11,
    marginTop: 2,
  },
  error: {
    color: "#ff9b9b",
    fontSize: 11,
    marginTop: 2,
  },
});
