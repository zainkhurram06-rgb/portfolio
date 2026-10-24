import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.MEDIA_DIR = mkdtempSync(join(tmpdir(), "media-"));
// imported after MEDIA_DIR is set, so the tests write to a throwaway folder
const media = () => import("./media");

const JPG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
const MP4 = new Uint8Array([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);

test("saves photos and videos and hands back their address", async () => {
  const { readMedia, saveMedia } = await media();
  assert.equal(await saveMedia("Glow Lab Nails", "Post 1.JPG", JPG), "/media/glow-lab-nails/post-1.jpg");
  assert.equal(await saveMedia("glow-lab-nails", "reel.mp4", MP4), "/media/glow-lab-nails/reel.mp4");
  const m = await readMedia(["glow-lab-nails", "post-1.jpg"]);
  assert.equal(m?.mime, "image/jpeg");
  assert.equal(m?.size, JPG.length);
});

test("a file has to really be what its name says", async () => {
  const { saveMedia } = await media();
  await assert.rejects(saveMedia("x", "evil.jpg", new TextEncoder().encode("<script>alert(1)</script>")), /isn't really/);
  await assert.rejects(saveMedia("x", "page.html", JPG), /send a jpg/);
  await assert.rejects(saveMedia("x", "logo.svg", JPG), /send a jpg/);
});

test("nobody can read files outside the media folder", async () => {
  const { readMedia } = await media();
  assert.equal(await readMedia(["..", "..", "package.json"]), null);
  assert.equal(await readMedia(["%2e%2e", "secret.jpg"]), null);
  assert.equal(await readMedia(["glow-lab-nails", "missing.jpg"]), null);
});
