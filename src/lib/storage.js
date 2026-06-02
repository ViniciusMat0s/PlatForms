const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export function loadState(key, fallback) {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveState(key, value) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(key, JSON.stringify(value));
}
