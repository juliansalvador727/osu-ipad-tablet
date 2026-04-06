import { mouse, keyboard, Point, Key, Button } from "@nut-tree-fork/nut-js";
import { Message, MessageType } from "./protocol.js";

export type TapAction = "key_z" | "key_x" | "mouse_left";

let tapAction: TapAction = "key_z";
let verbose = false;
let actionQueue: Promise<void> = Promise.resolve();
let pendingMove: Point | null = null;
let moveTaskQueued = false;

export function configure(opts: { tapAction?: TapAction; verbose?: boolean }) {
  if (opts.tapAction) tapAction = opts.tapAction;
  if (opts.verbose !== undefined) verbose = opts.verbose;
}

export function handleMessage(msg: Message): void {
  switch (msg.type) {
    case MessageType.MOVE:
      queueMove(msg.x, msg.y);
      if (verbose) console.log(`MOVE ${msg.x},${msg.y}`);
      break;

    case MessageType.TOUCH_DOWN:
      queueMove(msg.x, msg.y);
      if (verbose) console.log(`DOWN ${msg.x},${msg.y}`);
      break;

    case MessageType.TOUCH_UP:
      if (verbose) console.log(`UP`);
      break;

    case MessageType.TAP:
      queueTap(msg.x, msg.y);
      if (verbose) console.log(`TAP ${msg.x},${msg.y}`);
      break;
  }
}

function queueMove(x: number, y: number): void {
  pendingMove = new Point(x, y);

  if (moveTaskQueued) {
    return;
  }

  moveTaskQueued = true;
  actionQueue = actionQueue.then(flushMoves).catch(logError);
}

async function flushMoves(): Promise<void> {
  while (pendingMove) {
    const point = pendingMove;
    pendingMove = null;
    await mouse.setPosition(point);
  }

  moveTaskQueued = false;
}

function queueTap(x: number, y: number): void {
  actionQueue = actionQueue
    .then(async () => {
      await mouse.setPosition(new Point(x, y));
      await executeTap();
    })
    .catch(logError);
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
