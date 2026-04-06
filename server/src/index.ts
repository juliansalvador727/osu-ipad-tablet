import os from "node:os";
import { getLocalIPs } from "./screenInfo.js";
import { startServer } from "./websocketServer.js";
import { configure } from "./inputHandler.js";

const PORT = parseInt(process.env.PORT ?? "8080", 10);
const TAP_ACTION = (process.env.TAP_ACTION ?? "key_z") as "key_z" | "key_x" | "mouse_left";
const VERBOSE = process.env.VERBOSE === "1";

configure({ tapAction: TAP_ACTION, verbose: VERBOSE });

console.log("=== osu! tablet server ===\n");

if (isRunningInWsl()) {
  console.log("Warning: server is running inside WSL.");
  console.log(
    "The websocket can connect, but desktop input injection may not control the Windows cursor."
  );
  console.log("Run the server from a native Windows terminal for actual mouse/keyboard control.\n");
}

const ips = getLocalIPs();
if (ips.length > 0) {
  console.log("Local IP addresses (enter one of these in the app):");
  for (const ip of ips) {
    console.log(`  ${ip}`);
  }
} else {
  console.log("No local IP addresses found. Check your network connection.");
}

console.log(`\nTap action: ${TAP_ACTION}`);
console.log(`Verbose: ${VERBOSE}\n`);

startServer(PORT);
console.log(`WebSocket server listening on port ${PORT}`);

function isRunningInWsl(): boolean {
  return Boolean(process.env.WSL_DISTRO_NAME) || os.release().toLowerCase().includes("microsoft");
}
