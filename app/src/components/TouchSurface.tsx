import { useRef, useCallback } from "react";
import { GestureResponderEvent, LayoutChangeEvent, StyleSheet, View } from "react-native";
import { MessageType } from "../types/protocol";
import { ActiveArea, CalibrationSettings } from "../types/settings";
import { encode } from "../lib/protocol";
import { mapToMonitor } from "../lib/coordinateMapper";

interface Props {
  wsRef: React.MutableRefObject<WebSocket | null>;
  activeArea: ActiveArea;
  calibration: CalibrationSettings;
  monitorWidth: number;
  monitorHeight: number;
  onSurfaceLayout?: (width: number, height: number) => void;
}

const TAP_DURATION_MS = 200;
const TAP_SLOP_PX = 12;

export function TouchSurface({
  wsRef,
  activeArea,
  calibration,
  monitorWidth,
  monitorHeight,
  onSurfaceLayout,
}: Props) {
  const settingsRef = useRef({ activeArea, calibration, monitorWidth, monitorHeight });
  settingsRef.current = { activeArea, calibration, monitorWidth, monitorHeight };
  const surfaceSizeRef = useRef({ width: 1, height: 1 });
  const touchStart = useRef(0);
  const touchOrigin = useRef({ x: 0, y: 0 });
  const lastTouch = useRef({ x: 0, y: 0 });
  const pendingMove = useRef<{ x: number; y: number } | null>(null);
  const moveFrame = useRef<number | null>(null);

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
      const { activeArea, calibration, monitorWidth, monitorHeight } = settingsRef.current;
      const { width, height } = surfaceSizeRef.current;
      const pos = mapToMonitor(
        touchX,
        touchY,
        width,
        height,
        activeArea,
        calibration,
        monitorWidth,
        monitorHeight
      );
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

  const flushMove = useCallback(() => {
    moveFrame.current = null;
    const point = pendingMove.current;
    if (!point) {
      return;
    }

    pendingMove.current = null;
    mapAndSend(MessageType.MOVE, point.x, point.y);
  }, [mapAndSend]);

  const queueMove = useCallback(
    (x: number, y: number) => {
      pendingMove.current = { x, y };
      if (moveFrame.current === null) {
        moveFrame.current = requestAnimationFrame(flushMove);
      }
    },
    [flushMove]
  );

  const flushPendingMove = useCallback(() => {
    if (moveFrame.current !== null) {
      cancelAnimationFrame(moveFrame.current);
      moveFrame.current = null;
    }
    flushMove();
  }, [flushMove]);

  const trackTouchPoint = (event: GestureResponderEvent) => {
    const point = getTouchPoint(event);
    lastTouch.current = point;
    return point;
  };

  const handleGrant = (event: GestureResponderEvent) => {
    touchStart.current = Date.now();
    const { x, y } = trackTouchPoint(event);
    touchOrigin.current = { x, y };
    pendingMove.current = null;
    mapAndSend(MessageType.TOUCH_DOWN, x, y);
  };

  const handleMove = (event: GestureResponderEvent) => {
    const { x, y } = trackTouchPoint(event);
    queueMove(x, y);
  };

  const handleRelease = () => {
    flushPendingMove();
    const { x, y } = lastTouch.current;
    const dx = x - touchOrigin.current.x;
    const dy = y - touchOrigin.current.y;
    const isTap =
      Date.now() - touchStart.current < TAP_DURATION_MS &&
      dx * dx + dy * dy <= TAP_SLOP_PX * TAP_SLOP_PX;

    if (isTap) {
      mapAndSend(MessageType.TAP, x, y);
    }
    mapAndSend(MessageType.TOUCH_UP, x, y);
  };

  const handleTerminate = () => {
    flushPendingMove();
    const { x, y } = lastTouch.current;
    mapAndSend(MessageType.TOUCH_UP, x, y);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    surfaceSizeRef.current = { width, height };
    onSurfaceLayout?.(width, height);
  };

  return (
    <View
      style={styles.surface}
      onLayout={handleLayout}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={handleGrant}
      onResponderMove={handleMove}
      onResponderRelease={handleRelease}
      onResponderTerminate={handleTerminate}
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
