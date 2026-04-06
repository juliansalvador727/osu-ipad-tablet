import { CalibrationSettings } from "../types/settings";

export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface CalibrationTarget extends NormalizedPoint {
  label: string;
}

export const CALIBRATION_EDGE_INSET = 0.08;

export const CALIBRATION_TARGETS: CalibrationTarget[] = [
  { label: "top-left", x: CALIBRATION_EDGE_INSET, y: CALIBRATION_EDGE_INSET },
  { label: "top-right", x: 1 - CALIBRATION_EDGE_INSET, y: CALIBRATION_EDGE_INSET },
  { label: "bottom-right", x: 1 - CALIBRATION_EDGE_INSET, y: 1 - CALIBRATION_EDGE_INSET },
  { label: "bottom-left", x: CALIBRATION_EDGE_INSET, y: 1 - CALIBRATION_EDGE_INSET },
];

const MIN_SPAN = 0.05;

export function applyCalibration(
  touchX: number,
  touchY: number,
  surfaceWidth: number,
  surfaceHeight: number,
  calibration: CalibrationSettings
): { x: number; y: number } {
  const width = Math.max(surfaceWidth, 1);
  const height = Math.max(surfaceHeight, 1);
  const rawX = touchX / width;
  const rawY = touchY / height;

  if (!calibration.enabled) {
    return {
      x: clamp01(rawX) * width,
      y: clamp01(rawY) * height,
    };
  }

  return {
    x: clamp01(rawX * calibration.scaleX + calibration.offsetX) * width,
    y: clamp01(rawY * calibration.scaleY + calibration.offsetY) * height,
  };
}

export function createCalibration(points: NormalizedPoint[]): CalibrationSettings {
  if (points.length !== CALIBRATION_TARGETS.length) {
    return defaultCalibration();
  }

  const observedLeft = (points[0].x + points[3].x) / 2;
  const observedRight = (points[1].x + points[2].x) / 2;
  const observedTop = (points[0].y + points[1].y) / 2;
  const observedBottom = (points[2].y + points[3].y) / 2;

  const targetLeft = CALIBRATION_TARGETS[0].x;
  const targetRight = CALIBRATION_TARGETS[1].x;
  const targetTop = CALIBRATION_TARGETS[0].y;
  const targetBottom = CALIBRATION_TARGETS[2].y;

  const scaleX = deriveScale(observedLeft, observedRight, targetLeft, targetRight);
  const scaleY = deriveScale(observedTop, observedBottom, targetTop, targetBottom);

  return {
    enabled: true,
    scaleX,
    offsetX: targetLeft - observedLeft * scaleX,
    scaleY,
    offsetY: targetTop - observedTop * scaleY,
  };
}

export function defaultCalibration(): CalibrationSettings {
  return {
    enabled: false,
    scaleX: 1,
    offsetX: 0,
    scaleY: 1,
    offsetY: 0,
  };
}

function deriveScale(
  observedMin: number,
  observedMax: number,
  targetMin: number,
  targetMax: number
): number {
  const observedSpan = observedMax - observedMin;
  if (Math.abs(observedSpan) < MIN_SPAN) {
    return 1;
  }

  return (targetMax - targetMin) / observedSpan;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
