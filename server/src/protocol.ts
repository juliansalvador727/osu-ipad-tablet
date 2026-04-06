export const MessageType = {
  MOVE: 0x01,
  TOUCH_DOWN: 0x02,
  TOUCH_UP: 0x03,
  TAP: 0x04,
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface Message {
  type: MessageType;
  x: number;
  y: number;
}

export function decode(data: Buffer): Message | null {
  if (data.length !== 5) return null;

  const type = data[0] as MessageType;
  if (type < 0x01 || type > 0x04) return null;

  const x = (data[1] << 8) | data[2];
  const y = (data[3] << 8) | data[4];

  return { type, x, y };
}
