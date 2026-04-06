#[cfg(windows)]
mod input;
#[cfg(windows)]
mod protocol;
#[cfg(windows)]
mod screen_info;
#[cfg(windows)]
mod server;

#[cfg(windows)]
#[tokio::main]
async fn main() -> anyhow::Result<()> {
  server::run().await
}

#[cfg(not(windows))]
fn main() {
  eprintln!("This Rust server only supports Windows. Run it from Windows, not WSL.");
  std::process::exit(1);
}
