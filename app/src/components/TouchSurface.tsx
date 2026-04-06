import { useRef, useCallback } from "react";
import { GestureResponderEvent, StyleSheet, View } from "react-native";
import { MessageType } from "../types/protocol";
import { ActiveArea } from "../types/settings";
import { encode } from "../lib/protocol";
import { mapToMonitor } from "../lib/coordinateMapper";

interface Props {
  wsRef: React.MutableRefObject<WebSocket | null>;
  activeArea: ActiveArea;
  monitorWidth: number;
  monitorHeight: number;
}

export function TouchSurface({ wsRef, activeArea, monitorWidth, monitorHeight }: Props) {
  const settingsRef = useRef({ activeArea, monitorWidth, monitorHeight });
  settingsRef.current = { activeArea, monitorWidth, monitorHeight };
  const touchStart = useRef(0);

  const send = useCallback(
    (type: MessageType, x: number, y: number) => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(encode(type, x, y));
      }
    },
    [wsRef]
  );

  const mapAndSend = useCallback(
    (type: MessageType, touchX: number, touchY: number) => {
      const { activeArea, monitorWidth, monitorHeight } = settingsRef.current;
      const pos = mapToMonitor(touchX, touchY, activeArea, monitorWidth, monitorHeight);
      if (pos) {
        send(type, pos.x, pos.y);
      }
    },
    [send]
  );

  const getTouchPoint = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    return { x: locationX, y: locationY };
  };

  const handleGrant = (event: GestureResponderEvent) => {
    touchStart.current = Date.now();
    const { x, y } = getTouchPoint(event);
    mapAndSend(MessageType.TOUCH_DOWN, x, y);
  };

  const handleMove = (event: GestureResponderEvent) => {
    const { x, y } = getTouchPoint(event);
    mapAndSend(MessageType.MOVE, x, y);
  };

  const handleRelease = (event: GestureResponderEvent) => {
    const { x, y } = getTouchPoint(event);
    if (Date.now() - touchStart.current < 200) {
      mapAndSend(MessageType.TAP, x, y);
    }
    mapAndSend(MessageType.TOUCH_UP, x, y);
  };

  return (
    <View
      style={styles.surface}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={handleGrant}
      onResponderMove={handleMove}
      onResponderRelease={handleRelease}
      onResponderTerminate={handleRelease}
      onResponderTerminationRequest={() => false}
    />
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    backgroundColor: "#0f0f23",
  },
});
