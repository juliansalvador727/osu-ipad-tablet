import { useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CALIBRATION_TARGETS, createCalibration, NormalizedPoint } from "../src/lib/calibration";
import { useSettings } from "../src/hooks/useSettings";

interface SurfaceSize {
  width: number;
  height: number;
}

const TARGET_RADIUS = 28;

export default function CalibrationScreen() {
  const router = useRouter();
  const { settings, loading, saveSettings } = useSettings();
  const [surfaceSize, setSurfaceSize] = useState<SurfaceSize>({ width: 1, height: 1 });
  const [points, setPoints] = useState<NormalizedPoint[]>([]);
  const [saving, setSaving] = useState(false);

  const step = points.length;
  const target = CALIBRATION_TARGETS[step];
  const targetPosition = useMemo(() => {
    if (!target) {
      return null;
    }

    return {
      left: target.x * surfaceSize.width,
      top: target.y * surfaceSize.height,
    };
  }, [surfaceSize.height, surfaceSize.width, target]);

  if (loading || !settings) {
    return (
      <View style={styles.loading}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSurfaceSize({ width, height });
  };

  const handleTouch = async (x: number, y: number) => {
    if (saving || !target) {
      return;
    }

    const nextPoints = [
      ...points,
      {
        x: x / Math.max(surfaceSize.width, 1),
        y: y / Math.max(surfaceSize.height, 1),
      },
    ];

    setPoints(nextPoints);

    if (nextPoints.length === CALIBRATION_TARGETS.length) {
      setSaving(true);
      await saveSettings({
        ...settings,
        calibration: createCalibration(nextPoints),
      });
      router.back();
    }
  };

  return (
    <View
      style={styles.container}
      onLayout={handleLayout}
      onStartShouldSetResponder={() => true}
      onResponderGrant={(event) => {
        const { locationX, locationY } = event.nativeEvent;
        void handleTouch(locationX, locationY);
      }}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Calibration</Text>
        <Text style={styles.subtitle}>
          Tap the marker as accurately as possible. Step {Math.min(step + 1, 4)} of 4.
        </Text>
        <Text style={styles.caption}>
          This stores an offset and scale correction on top of your normal touch area.
        </Text>
      </View>

      {targetPosition ? (
        <View
          pointerEvents="none"
          style={[
            styles.target,
            {
              left: targetPosition.left - TARGET_RADIUS,
              top: targetPosition.top - TARGET_RADIUS,
            },
          ]}
        >
          <View style={styles.targetInner} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a2e",
  },
  overlay: {
    position: "absolute",
    top: 24,
    left: 24,
    right: 24,
    zIndex: 1,
  },
  title: {
    color: "#e0e0e0",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#c7c7d1",
    fontSize: 16,
    marginTop: 8,
  },
  caption: {
    color: "#888",
    fontSize: 13,
    marginTop: 8,
  },
  text: {
    color: "#e0e0e0",
    fontSize: 16,
  },
  target: {
    position: "absolute",
    width: TARGET_RADIUS * 2,
    height: TARGET_RADIUS * 2,
    borderRadius: TARGET_RADIUS,
    borderWidth: 3,
    borderColor: "#74b9ff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(116, 185, 255, 0.16)",
  },
  targetInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff",
  },
});
