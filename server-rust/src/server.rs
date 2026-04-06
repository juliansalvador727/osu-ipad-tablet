use std::env;
use std::sync::Arc;

use anyhow::{Context, Result};
use futures_util::StreamExt;
use tokio::net::{TcpListener, TcpStream};
use tokio_tungstenite::{accept_async, tungstenite::Message as WsMessage};

use crate::input::{InputDispatcher, TapAction};
use crate::protocol::{decode, MessageType};
use crate::screen_info::get_local_ips;

pub async fn run() -> Result<()> {
  let port = env::var("PORT")
    .ok()
    .and_then(|value| value.parse::<u16>().ok())
    .unwrap_or(8080);
  let tap_action = TapAction::from_env(&env::var("TAP_ACTION").unwrap_or_else(|_| "key_z".to_string()));
  let verbose = env::var("VERBOSE").map(|value| value == "1").unwrap_or(false);

  println!("=== osu! tablet server (Rust) ===\n");

  let ips = get_local_ips();
  if ips.is_empty() {
    println!("No local IP addresses found. Check your network connection.");
  } else {
    println!("Local IP addresses (enter one of these in the app):");
    for ip in ips {
      println!("  {ip}");
    }
  }

  println!("\nTap action: {}", tap_action.as_env_value());
  println!("Verbose: {verbose}\n");

  let listener = TcpListener::bind(("0.0.0.0", port))
    .await
    .with_context(|| format!("failed to bind websocket server on port {port}"))?;

  println!("WebSocket server listening on port {port}");

  let input = Arc::new(InputDispatcher::new(tap_action));

  loop {
    let (stream, address) = listener.accept().await?;
    let input = Arc::clone(&input);

    tokio::spawn(async move {
      if let Err(err) = handle_connection(stream, input, verbose).await {
        eprintln!("Connection error ({address}): {err}");
      }
    });
  }
}

async fn handle_connection(
  stream: TcpStream,
  input: Arc<InputDispatcher>,
  verbose: bool,
) -> Result<()> {
  let address = stream
    .peer_addr()
    .map(|value| value.to_string())
    .unwrap_or_else(|_| "unknown".to_string());

  let mut websocket = accept_async(stream)
    .await
    .with_context(|| format!("websocket handshake failed for {address}"))?;

  println!("Client connected: {address}");

  while let Some(frame) = websocket.next().await {
    match frame {
      Ok(WsMessage::Binary(data)) => {
        if let Some(message) = decode(data.as_ref()) {
          if verbose {
            match message.kind {
              MessageType::Move => println!("MOVE {},{}", message.x, message.y),
              MessageType::TouchDown => println!("DOWN {},{}", message.x, message.y),
              MessageType::TouchUp => println!("UP"),
              MessageType::Tap => println!("TAP {},{}", message.x, message.y),
            }
          }

          input.dispatch(message)?;
        }
      }
      Ok(WsMessage::Close(_)) => break,
      Ok(_) => {}
      Err(err) => {
        eprintln!("WebSocket error ({address}): {err}");
        break;
      }
    }
  }

  println!("Client disconnected: {address}");
  Ok(())
}
