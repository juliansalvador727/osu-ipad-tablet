import { ActiveArea } from "../types/settings";

export interface MappedPosition {
  x: number;
  y: number;
}

export function mapToMonitor(
  touchX: number,
  touchY: number,
  activeArea: ActiveArea,
  monitorWidth: number,
  monitorHeight: number
): MappedPosition | null {
  // Check if touch is inside active area
  if (
    touchX < activeArea.x ||
    touchX > activeArea.x + activeArea.width ||
    touchY < activeArea.y ||
    touchY > activeArea.y + activeArea.height
  ) {
    return null;
  }

  const normalizedX = (touchX - activeArea.x) / activeArea.width;
  const normalizedY = (touchY - activeArea.y) / activeArea.height;

  const x = Math.max(0, Math.min(monitorWidth, Math.round(normalizedX * monitorWidth)));
  const y = Math.max(0, Math.min(monitorHeight, Math.round(normalizedY * monitorHeight)));

  return { x, y };
}
