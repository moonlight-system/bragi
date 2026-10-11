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
  colors: Record<string, string>;   // CSS variable name -> color, only the ones the user has set
};