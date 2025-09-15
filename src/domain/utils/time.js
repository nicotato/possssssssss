export function nowIso() {
  return new Date().toISOString();
}
export function minutesFromNow(minutes) {
  return new Date(Date.now() + minutes * 60000).toISOString();
}