export const FONT_OPTIONS = [
{ name: "Silkscreen", family: '"Silkscreen", sans-serif', spacing: "0.1em" },
  { name: "Pixelify Sans", family: '"Pixelify Sans", sans-serif', spacing: "0.15em" },
  { name: "Atkinson Hyperlegible", family: '"Atkinson Hyperlegible", sans-serif', spacing: "0.03em" },
  { name: "Lexend", family: '"Lexend", sans-serif', spacing: "0.03em" },
  { name: "System default", family: "system-ui, sans-serif", spacing: "0.03em" },
  { name: "Monospace", family: "ui-monospace, Consolas, monospace", spacing: "0.03em" },
  { name: "Inter", family: '"Inter", sans-serif', spacing: "0.02em" },
  { name: "Nunito", family: '"Nunito", sans-serif', spacing: "0.03em" },
  { name: "Open Sans", family: '"Open Sans", sans-serif', spacing: "0.02em" },
  { name: "IBM Plex Sans", family: '"IBM Plex Sans", sans-serif', spacing: "0.02em" },
  { name: "Source Sans 3", family: '"Source Sans 3", sans-serif', spacing: "0.03em" },
  { name: "Comic Neue", family: '"Comic Neue", sans-serif', spacing: "0.04em" },
  { name: "OpenDyslexic", family: '"OpenDyslexic", sans-serif', spacing: "0.02em" },
  { name: "JetBrains Mono", family: '"JetBrains Mono", monospace', spacing: "0.02em" },
  { name: "VT323", family: '"VT323", monospace', spacing: "0.08em" },
  { name: "Press Start 2P", family: '"Press Start 2P", monospace', spacing: "0.05em" },
];

export const DEFAULT_FONT = "Pixelify Sans";

// sets the CSS variables the whole app reads
export function applyFont(name: string) {
  const font = FONT_OPTIONS.find(f => f.name === name) ?? FONT_OPTIONS[0];
  document.documentElement.style.setProperty("--app-font", font.family);
  document.documentElement.style.setProperty("--app-letter-spacing", font.spacing);
}