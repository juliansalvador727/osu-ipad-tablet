export interface ActiveArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CalibrationSettings {
  enabled: boolean;
  scaleX: number;
  offsetX: number;
  scaleY: number;
  offsetY: number;
}

export type TapAction = "key_z" | "key_x" | "mouse_left";

export interface AppSettings {
  serverIp: string;
  serverPort: number;
  monitorWidth: number;
  monitorHeight: number;
  activeArea: ActiveArea;
  calibration: CalibrationSettings;
  tapAction: TapAction;
}

export const DEFAULT_SETTINGS: AppSettings = {
  serverIp: "",
  serverPort: 8080,
  monitorWidth: 1920,
  monitorHeight: 1080,
  activeArea: { x: 0, y: 0, width: 0, height: 0 }, // 0 means "use full screen"
  calibration: {
    enabled: false,
    scaleX: 1,
    offsetX: 0,
    scaleY: 1,
    offsetY: 0,
  },
  tapAction: "key_z",
};
