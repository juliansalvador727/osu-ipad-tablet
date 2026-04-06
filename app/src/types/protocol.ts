export const MessageType = {
  MOVE: 0x01,
  TOUCH_DOWN: 0x02,
  TOUCH_UP: 0x03,
  TAP: 0x04,
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];
