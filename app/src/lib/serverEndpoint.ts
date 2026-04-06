function hasWebSocketScheme(value: string): boolean {
  return value.startsWith("ws://") || value.startsWith("wss://");
}

export function buildWebSocketUrl(server: string, port: number): string {
  const trimmed = server.trim();

  if (hasWebSocketScheme(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const url = new URL(trimmed);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return url.toString();
  }

  if (trimmed.includes(":")) {
    return `ws://${trimmed}`;
  }

  return `ws://${trimmed}:${port}`;
}

export function formatServerTarget(server: string, port: number): string {
  const trimmed = server.trim();

  if (!trimmed) {
    return "(not set)";
  }

  if (
    hasWebSocketScheme(trimmed) ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  if (trimmed.includes(":")) {
    return trimmed;
  }

  return `${trimmed}:${port}`;
}
