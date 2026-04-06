import { MessageType } from "../types/protocol";

const buffer = new ArrayBuffer(5);
const view = new DataView(buffer);

export function encode(type: MessageType, x: number, y: number): ArrayBuffer {
  view.setUint8(0, type);
  view.setUint16(1, x);
  view.setUint16(3, y);
  return buffer;
}
