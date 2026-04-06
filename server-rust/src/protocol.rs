#[derive(Clone, Copy, Debug)]
pub enum MessageType {
  Move = 0x01,
  TouchDown = 0x02,
  TouchUp = 0x03,
  Tap = 0x04,
}

#[derive(Clone, Copy, Debug)]
pub struct Message {
  pub kind: MessageType,
  pub x: i32,
  pub y: i32,
}

pub fn decode(data: &[u8]) -> Option<Message> {
  if data.len() != 5 {
    return None;
  }

  let kind = match data[0] {
    0x01 => MessageType::Move,
    0x02 => MessageType::TouchDown,
    0x03 => MessageType::TouchUp,
    0x04 => MessageType::Tap,
    _ => return None,
  };

  let x = u16::from_be_bytes([data[1], data[2]]) as i32;
  let y = u16::from_be_bytes([data[3], data[4]]) as i32;

  Some(Message { kind, x, y })
}
