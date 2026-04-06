use if_addrs::get_if_addrs;

pub fn get_local_ips() -> Vec<String> {
  let mut ips: Vec<String> = get_if_addrs()
    .map(|addrs| {
      addrs
        .into_iter()
        .filter(|addr| addr.ip().is_ipv4() && !addr.is_loopback())
        .map(|addr| addr.ip().to_string())
        .collect()
    })
    .unwrap_or_default();

  ips.sort();
  ips.dedup();
  ips
}
