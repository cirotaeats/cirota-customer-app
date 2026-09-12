/**
 * Artificial network latency simulator for realistic loading states
 */
export function delay(ms = null) {
  const time = ms !== null ? ms : Math.floor(Math.random() * 300) + 200; // 200 - 500ms default
  return new Promise((resolve) => setTimeout(resolve, time));
}
