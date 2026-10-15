export type Song = {
  id: string;
  path: string;   // path to the mp3 file, relative to the songs/ folder
  name: string;
  artist: string;
};

export type Playlist = {
  id: string;
  name: string;
  songIds: string[];
  cover?: string;   // data URL of the cover image, if the user set one
};

export function getCssVariable(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function formatTime(seconds: number): string {
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export type UserPreferences = {
  colors: Record<string, string>;
  backOnRight?: boolean;
  showKeybinds?: boolean;
  font?: string;
};

export const isAndroid = navigator.userAgent.includes('Android');

// crypto.randomUUID only exists in secure contexts; getRandomValues works everywhere
export function newId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;   // UUID version 4
  b[8] = (b[8] & 0x3f) | 0x80;   // UUID variant
  const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}