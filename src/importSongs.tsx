import { open } from '@tauri-apps/plugin-dialog';
import { join } from '@tauri-apps/api/path';
import { readFile, writeFile } from '@tauri-apps/plugin-fs';
import { parseBuffer } from 'music-metadata';
import { getBragiDir } from './storage';
import { isAndroid, newId } from './types_and_functions';
import type { Song } from './types_and_functions';

async function readTags(bytes: Uint8Array): Promise<{ title: string | null; artist: string | null }> {
  try {
    const meta = await parseBuffer(bytes, { mimeType: 'audio/mpeg' }, { duration: false, skipCovers: true });
    console.log('tags:', meta.common.title, '|', meta.common.artist, '| tag types:', meta.format.tagTypes);
    console.log('frames:', Object.entries(meta.native).map(([type, tags]) => [type, tags.map(t => t.id)]));
    
    return { title: meta.common.title?.trim() || null, artist: meta.common.artist?.trim() || null };
  } catch (err) {
    console.error('could not read tags:', err);
    return { title: null, artist: null };
  }
}

// Android gives URIs like content://.../primary%3AMusic%2Ffoo.mp3: decode, then take the last piece
function nameFromPath(path: string): string | null {
  try {
    const last = decodeURIComponent(path).split(/[\\/:]/).pop() ?? '';
    return /\.mp3$/i.test(last) ? last.replace(/\.mp3$/i, '') : null;
  } catch {
    return null;
  }
}

// opens the file picker and imports the chosen mp3s; calls onSong as each one finishes
export async function pickSongs(onSong: (song: Song) => void): Promise<void> {
  const selected = await open({
    multiple: true,
    filters: [{ name: 'Audio', extensions: ['mp3'] }],
  });
  if (!selected) return;   // user cancelled
  const paths = Array.isArray(selected) ? selected : [selected];

  const bragiDir = await getBragiDir();
  for (const sourcePath of paths) {
    const t0 = performance.now();
    const id = newId();
    console.log('source:', sourcePath);
    const bytes = await readFile(sourcePath);
    const t1 = performance.now();
    const dest = await join(bragiDir, 'songs', `${id}.mp3`);
    const [, { title, artist }] = await Promise.all([writeFile(dest, bytes), readTags(bytes)]);
    const t2 = performance.now();
    const t3 = performance.now();
    console.log(
      `import: ${(bytes.length / 1e6).toFixed(1)}MB | read ${Math.round(t1 - t0)}ms | ` +
      `write ${Math.round(t2 - t1)}ms | tags ${Math.round(t3 - t2)}ms`
    );

    const fileName = sourcePath.split(/[\\/]/).pop() ?? 'Unknown';
    onSong({
      id,
      path: `${id}.mp3`,
      name: isAndroid ? (title ?? nameFromPath(sourcePath) ?? 'Unknown') : fileName.replace(/\.mp3$/i, ''),
      artist: artist ?? 'Unknown Artist',
    });
  }
}