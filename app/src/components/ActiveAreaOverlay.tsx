import { View, StyleSheet } from "react-native";
import { ActiveArea } from "../types/settings";

interface Props {
  activeArea: ActiveArea;
  screenWidth: number;
  screenHeight: number;
}

export function ActiveAreaOverlay({ activeArea, screenWidth, screenHeight }: Props) {
  const isFullScreen =
    activeArea.x === 0 &&
    activeArea.y === 0 &&
    activeArea.width >= screenWidth &&
    activeArea.height >= screenHeight;

  if (isFullScreen) {
    return (
      <View
        style={[styles.border, { width: screenWidth, height: screenHeight }]}
        pointerEvents="none"
      />
    );
  }

  const { x, y, width, height } = activeArea;
  const right = x + width;
  const bottom = y + height;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Top dim */}
      <View style={[styles.dim, { top: 0, left: 0, right: 0, height: y }]} />
      {/* Bottom dim */}
      <View style={[styles.dim, { top: bottom, left: 0, right: 0, bottom: 0 }]} />
      {/* Left dim */}
      <View style={[styles.dim, { top: y, left: 0, width: x, height }]} />
      {/* Right dim */}
      <View style={[styles.dim, { top: y, left: right, right: 0, height }]} />
      {/* Active area border */}
      <View style={[styles.border, { left: x, top: y, width, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  dim: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  border: {
    position: "absolute",
    top: 0,
    left: 0,
    borderWidth: 2,
    borderColor: "rgba(0, 200, 255, 0.5)",
  },
});
