export function formatLength(m) {
  if (m >= 0.1) return `${(m * 100).toFixed(2)} cm`;
  if (m >= 0.001) return `${(m * 1000).toFixed(2)} mm`;
  return `${(m * 1e6).toFixed(1)} µm`;
}

export function formatDb(v, digits = 2) {
  return `${v.toFixed(digits)} dB`;
}

export function formatDbm(v, digits = 2) {
  return `${v.toFixed(digits)} dBm`;
}
