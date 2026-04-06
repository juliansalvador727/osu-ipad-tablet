import { applyCalibration } from "./calibration";
import { ActiveArea, CalibrationSettings } from "../types/settings";

export interface MappedPosition {
  x: number;
  y: number;
}

export function mapToMonitor(
  touchX: number,
  touchY: number,
  surfaceWidth: number,
  surfaceHeight: number,
  activeArea: ActiveArea,
  calibration: CalibrationSettings,
  monitorWidth: number,
  monitorHeight: number
): MappedPosition | null {
  const maxX = Math.max(0, monitorWidth - 1);
  const maxY = Math.max(0, monitorHeight - 1);
  const corrected = applyCalibration(
    touchX,
    touchY,
    surfaceWidth,
    surfaceHeight,
    calibration
  );

  // Check if touch is inside active area
  if (
    corrected.x < activeArea.x ||
    corrected.x > activeArea.x + activeArea.width ||
    corrected.y < activeArea.y ||
    corrected.y > activeArea.y + activeArea.height
  ) {
    return null;
  }

  const normalizedX = (corrected.x - activeArea.x) / activeArea.width;
  const normalizedY = (corrected.y - activeArea.y) / activeArea.height;

  const x = Math.max(0, Math.min(maxX, Math.round(normalizedX * maxX)));
  const y = Math.max(0, Math.min(maxY, Math.round(normalizedY * maxY)));

  return { x, y };
}
