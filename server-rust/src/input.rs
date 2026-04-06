use std::sync::mpsc::{self, Receiver, Sender, TryRecvError};
use std::thread;

use anyhow::{anyhow, Result};

use crate::protocol::{Message, MessageType};

#[derive(Clone, Copy, Debug)]
pub enum TapAction {
  KeyZ,
  KeyX,
  MouseLeft,
}

impl TapAction {
  pub fn from_env(value: &str) -> Self {
    match value {
      "key_x" => Self::KeyX,
      "mouse_left" => Self::MouseLeft,
      _ => Self::KeyZ,
    }
  }

  pub fn as_env_value(self) -> &'static str {
    match self {
      Self::KeyZ => "key_z",
      Self::KeyX => "key_x",
      Self::MouseLeft => "mouse_left",
    }
  }
}

pub struct InputDispatcher {
  sender: Sender<Message>,
}

impl InputDispatcher {
  pub fn new(tap_action: TapAction) -> Self {
    let (sender, receiver) = mpsc::channel();
    thread::spawn(move || run_input_loop(receiver, tap_action));
    Self { sender }
  }

  pub fn dispatch(&self, message: Message) -> Result<()> {
    self
      .sender
      .send(message)
      .map_err(|_| anyhow!("input thread stopped"))
  }
}

fn run_input_loop(receiver: Receiver<Message>, tap_action: TapAction) {
  while let Ok(message) = receiver.recv() {
    match message.kind {
      MessageType::Move | MessageType::TouchDown => {
        let mut latest = message;

        loop {
          match receiver.try_recv() {
            Ok(candidate @ Message { kind: MessageType::Move | MessageType::TouchDown, .. }) => {
              latest = candidate;
            }
            Ok(candidate) => {
              if let Err(err) = move_cursor(latest.x, latest.y) {
                eprintln!("Input error: {err}");
              }
              handle_non_move(candidate, tap_action);
              break;
            }
            Err(TryRecvError::Empty) => {
              if let Err(err) = move_cursor(latest.x, latest.y) {
                eprintln!("Input error: {err}");
              }
              break;
            }
            Err(TryRecvError::Disconnected) => {
              if let Err(err) = move_cursor(latest.x, latest.y) {
                eprintln!("Input error: {err}");
              }
              return;
            }
          }
        }
      }
      _ => handle_non_move(message, tap_action),
    }
  }
}

fn handle_non_move(message: Message, tap_action: TapAction) {
  match message.kind {
    MessageType::TouchUp => {}
    MessageType::Tap => {
      if let Err(err) = move_cursor(message.x, message.y).and_then(|_| execute_tap(tap_action)) {
        eprintln!("Input error: {err}");
      }
    }
    MessageType::Move | MessageType::TouchDown => {
      if let Err(err) = move_cursor(message.x, message.y) {
        eprintln!("Input error: {err}");
      }
    }
  }
}

#[cfg(windows)]
fn move_cursor(x: i32, y: i32) -> Result<()> {
  use std::mem::size_of;
  use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
    SendInput, INPUT, INPUT_0, INPUT_MOUSE, MOUSEEVENTF_ABSOLUTE, MOUSEEVENTF_MOVE,
    MOUSEEVENTF_VIRTUALDESK, MOUSEINPUT,
  };
  use windows_sys::Win32::UI::WindowsAndMessaging::{
    GetSystemMetrics, SM_CXVIRTUALSCREEN, SM_CYVIRTUALSCREEN, SM_XVIRTUALSCREEN, SM_YVIRTUALSCREEN,
  };

  let virtual_x = unsafe { GetSystemMetrics(SM_XVIRTUALSCREEN) };
  let virtual_y = unsafe { GetSystemMetrics(SM_YVIRTUALSCREEN) };
  let virtual_width = unsafe { GetSystemMetrics(SM_CXVIRTUALSCREEN) };
  let virtual_height = unsafe { GetSystemMetrics(SM_CYVIRTUALSCREEN) };

  if virtual_width <= 0 || virtual_height <= 0 {
    return Err(anyhow!("Could not read virtual screen bounds"));
  }

  let absolute_x = ((x - virtual_x) * 65535 / (virtual_width - 1)).clamp(0, 65535);
  let absolute_y = ((y - virtual_y) * 65535 / (virtual_height - 1)).clamp(0, 65535);

  let mut input = INPUT {
    r#type: INPUT_MOUSE,
    Anonymous: INPUT_0 {
      mi: MOUSEINPUT {
        dx: absolute_x,
        dy: absolute_y,
        mouseData: 0,
        dwFlags: MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_VIRTUALDESK,
        time: 0,
        dwExtraInfo: 0,
      },
    },
  };

  let sent = unsafe { SendInput(1, &mut input, size_of::<INPUT>() as i32) };
  if sent != 1 {
    Err(anyhow!("SendInput mouse move failed"))
  } else {
    Ok(())
  }
}

#[cfg(windows)]
fn execute_tap(tap_action: TapAction) -> Result<()> {
  match tap_action {
    TapAction::KeyZ => send_key(0x5A),
    TapAction::KeyX => send_key(0x58),
    TapAction::MouseLeft => send_left_click(),
  }
}

#[cfg(windows)]
fn send_key(virtual_key: u16) -> Result<()> {
  use std::mem::size_of;
  use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
    SendInput, INPUT, INPUT_0, INPUT_KEYBOARD, KEYBDINPUT, KEYEVENTF_KEYUP,
  };

  let mut inputs = [
    INPUT {
      r#type: INPUT_KEYBOARD,
      Anonymous: INPUT_0 {
        ki: KEYBDINPUT {
          wVk: virtual_key,
          wScan: 0,
          dwFlags: 0,
          time: 0,
          dwExtraInfo: 0,
        },
      },
    },
    INPUT {
      r#type: INPUT_KEYBOARD,
      Anonymous: INPUT_0 {
        ki: KEYBDINPUT {
          wVk: virtual_key,
          wScan: 0,
          dwFlags: KEYEVENTF_KEYUP,
          time: 0,
          dwExtraInfo: 0,
        },
      },
    },
  ];

  let sent = unsafe { SendInput(inputs.len() as u32, inputs.as_mut_ptr(), size_of::<INPUT>() as i32) };
  if sent != inputs.len() as u32 {
    Err(anyhow!("SendInput keyboard event failed"))
  } else {
    Ok(())
  }
}

#[cfg(windows)]
fn send_left_click() -> Result<()> {
  use std::mem::size_of;
  use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
    SendInput, INPUT, INPUT_0, INPUT_MOUSE, MOUSEEVENTF_LEFTDOWN, MOUSEEVENTF_LEFTUP, MOUSEINPUT,
  };

  let mut inputs = [
    INPUT {
      r#type: INPUT_MOUSE,
      Anonymous: INPUT_0 {
        mi: MOUSEINPUT {
          dx: 0,
          dy: 0,
          mouseData: 0,
          dwFlags: MOUSEEVENTF_LEFTDOWN,
          time: 0,
          dwExtraInfo: 0,
        },
      },
    },
    INPUT {
      r#type: INPUT_MOUSE,
      Anonymous: INPUT_0 {
        mi: MOUSEINPUT {
          dx: 0,
          dy: 0,
          mouseData: 0,
          dwFlags: MOUSEEVENTF_LEFTUP,
          time: 0,
          dwExtraInfo: 0,
        },
      },
    },
  ];

  let sent = unsafe { SendInput(inputs.len() as u32, inputs.as_mut_ptr(), size_of::<INPUT>() as i32) };
  if sent != inputs.len() as u32 {
    Err(anyhow!("SendInput mouse event failed"))
  } else {
    Ok(())
  }
}
