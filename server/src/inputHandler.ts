import { mouse, keyboard, Point, Key, Button } from "@nut-tree-fork/nut-js";
import { Message, MessageType } from "./protocol.js";

export type TapAction = "key_z" | "key_x" | "mouse_left";

let tapAction: TapAction = "key_z";
let verbose = false;

export function configure(opts: { tapAction?: TapAction; verbose?: boolean }) {
  if (opts.tapAction) tapAction = opts.tapAction;
  if (opts.verbose !== undefined) verbose = opts.verbose;
}

export function handleMessage(msg: Message): void {
  switch (msg.type) {
    case MessageType.MOVE:
      mouse.setPosition(new Point(msg.x, msg.y)).catch(logError);
      if (verbose) console.log(`MOVE ${msg.x},${msg.y}`);
      break;

    case MessageType.TOUCH_DOWN:
      mouse.setPosition(new Point(msg.x, msg.y)).catch(logError);
      if (verbose) console.log(`DOWN ${msg.x},${msg.y}`);
      break;

    case MessageType.TOUCH_UP:
      if (verbose) console.log(`UP`);
      break;

    case MessageType.TAP:
      mouse.setPosition(new Point(msg.x, msg.y)).catch(logError);
      executeTap();
      if (verbose) console.log(`TAP ${msg.x},${msg.y}`);
      break;
  }
}

async function executeTap(): Promise<void> {
  try {
    switch (tapAction) {
      case "key_z":
        await keyboard.pressKey(Key.Z);
        await keyboard.releaseKey(Key.Z);
        break;
      case "key_x":
        await keyboard.pressKey(Key.X);
        await keyboard.releaseKey(Key.X);
        break;
      case "mouse_left":
        await mouse.click(Button.LEFT);
        break;
    }
  } catch (err) {
    logError(err);
  }
}

function logError(err: unknown): void {
  console.error("Input error:", err);
}
