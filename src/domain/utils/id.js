export function generateId(prefix = '') {
  return prefix + Math.random().toString(36).substring(2, 8) + Date.now().toString(36);
}