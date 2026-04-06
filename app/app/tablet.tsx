import { useEffect, useState } from "react";
import { StyleSheet, Dimensions, StatusBar, View } from "react-native";
import { TouchSurface } from "../src/components/TouchSurface";
import { ActiveAreaOverlay } from "../src/components/ActiveAreaOverlay";
import { ConnectionStatus } from "../src/components/ConnectionStatus";
import { useSettings } from "../src/hooks/useSettings";
import { useWebSocket } from "../src/hooks/useWebSocket";
import { ActiveArea } from "../src/types/settings";

export default function TabletScreen() {
  const { settings, loading } = useSettings();
  const { wsRef, status, target, error, connect, disconnect } = useWebSocket();
  const [screenSize, setScreenSize] = useState(() => Dimensions.get("window"));

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      setScreenSize(window);
    });
    return () => sub.remove();
  }, []);

  // Auto-connect when screen mounts, disconnect on unmount
  useEffect(() => {
    if (settings && settings.serverIp) {
      connect(settings.serverIp, settings.serverPort);
    }
    return () => disconnect();
  }, [settings?.serverIp, settings?.serverPort]);

  if (loading || !settings) return null;

  // Resolve active area: 0 dimensions = full screen
  const activeArea: ActiveArea = {
    x: settings.activeArea.x,
    y: settings.activeArea.y,
    width: settings.activeArea.width || screenSize.width,
    height: settings.activeArea.height || screenSize.height,
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <TouchSurface
        wsRef={wsRef}
        activeArea={activeArea}
        monitorWidth={settings.monitorWidth}
        monitorHeight={settings.monitorHeight}
      />
      <ActiveAreaOverlay
        activeArea={activeArea}
        screenWidth={screenSize.width}
        screenHeight={screenSize.height}
      />
      <ConnectionStatus status={status} target={target} error={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
  },
});
