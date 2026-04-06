# Rust Windows Server

This replaces the Node + `nut-js` server with a native Windows Rust server while keeping the same 5-byte websocket protocol used by the Expo app.

## Run on Windows

```powershell
cd C:\path\to\osu-ipad-tablet\server-rust
cargo run --release
```

Optional environment variables:

```powershell
$env:PORT="8080"
$env:TAP_ACTION="key_z"   # key_z | key_x | mouse_left
$env:VERBOSE="1"
cargo run --release
```

This server only supports Windows and should not be run from WSL.
