// Serves client photos and videos. Videos answer range requests, which Safari
// needs to play them at all.

import { readMedia } from "@/lib/media";

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const m = await readMedia((await params).path);
  if (!m) return new Response("not found", { status: 404 });
  const body = await m.read();
  const headers = { "content-type": m.mime, "cache-control": "public, max-age=31536000, immutable", "accept-ranges": "bytes" };
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
  if (range) {
    const start = range[1] ? Number(range[1]) : Math.max(0, m.size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), m.size - 1) : m.size - 1;
    if (start >= m.size || start > end) return new Response(null, { status: 416, headers: { "content-range": `bytes */${m.size}` } });
    return new Response(new Uint8Array(body.subarray(start, end + 1)), {
      status: 206, headers: { ...headers, "content-range": `bytes ${start}-${end}/${m.size}`, "content-length": String(end - start + 1) },
    });
  }
  return new Response(new Uint8Array(body), { headers: { ...headers, "content-length": String(m.size) } });
}
