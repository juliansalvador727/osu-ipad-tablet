export interface ActiveArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TapAction = "key_z" | "key_x" | "mouse_left";

export interface AppSettings {
  serverIp: string;
  serverPort: number;
  monitorWidth: number;
  monitorHeight: number;
  activeArea: ActiveArea;
  tapAction: TapAction;
}

export const DEFAULT_SETTINGS: AppSettings = {
  serverIp: "",
  serverPort: 8080,
  monitorWidth: 1920,
  monitorHeight: 1080,
  activeArea: { x: 0, y: 0, width: 0, height: 0 }, // 0 means "use full screen"
  tapAction: "key_z",
};
