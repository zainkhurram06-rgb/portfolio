// Photos and videos for client websites (their logo, posts, reels). Kept on disk
// in MEDIA_DIR for now. Moving to cloud storage later means changing this file only.

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";

export const MEDIA_DIR = resolve(process.env.MEDIA_DIR ?? ".media");

export const TYPES: Record<string, { mime: string; max: number }> = {
  ".jpg": { mime: "image/jpeg", max: 15e6 },
  ".jpeg": { mime: "image/jpeg", max: 15e6 },
  ".png": { mime: "image/png", max: 15e6 },
  ".webp": { mime: "image/webp", max: 15e6 },
  ".gif": { mime: "image/gif", max: 15e6 },
  ".mp4": { mime: "video/mp4", max: 80e6 },
  ".webm": { mime: "video/webm", max: 80e6 },
};

// what the file really is, from its first bytes, so a renamed script can't sneak in
function sniff(b: Uint8Array): string | null {
  const at = (i: number, ...v: number[]) => v.every((x, j) => b[i + j] === x);
  if (at(0, 0xff, 0xd8, 0xff)) return "image/jpeg";
  if (at(0, 0x89, 0x50, 0x4e, 0x47)) return "image/png";
  if (at(0, 0x47, 0x49, 0x46, 0x38)) return "image/gif";
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return "image/webp";
  if (at(4, 0x66, 0x74, 0x79, 0x70)) return "video/mp4";
  if (at(0, 0x1a, 0x45, 0xdf, 0xa3)) return "video/webm";
  return null;
}

const safe = (s: string) => s.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/^[-.]+/, "").slice(0, 80);

export async function saveMedia(folder: string, name: string, bytes: Uint8Array) {
  const dir = safe(folder);
  const file = safe(name);
  const type = TYPES[extname(file)];
  if (!dir || !file || !type) throw new MediaError("send a jpg, png, webp, gif, mp4 or webm with a folder name");
  if (bytes.byteLength > type.max) throw new MediaError(`${file} is too big`);
  if (sniff(bytes) !== type.mime) throw new MediaError(`${file} isn't really a ${extname(file)}`);
  await mkdir(join(MEDIA_DIR, dir), { recursive: true });
  await writeFile(join(MEDIA_DIR, dir, file), bytes);
  return `/media/${dir}/${file}`;
}

export async function readMedia(parts: string[]) {
  const path = resolve(MEDIA_DIR, ...parts.map(decodeURIComponent));
  if (!path.startsWith(MEDIA_DIR + sep)) return null;      // no ../ tricks
  const type = TYPES[extname(path).toLowerCase()];
  if (!type) return null;
  try {
    const info = await stat(path);
    return { path, size: info.size, mime: type.mime, read: () => readFile(path) };
  } catch {
    return null;
  }
}

export class MediaError extends Error {}
