// The private door MARK and Jarvis use. A long secret token in the header,
// compared in constant time. Without INTERNAL_API_TOKEN set, the door stays shut.

import { createHash, timingSafeEqual } from "node:crypto";

export function internalAllowed(req: Request) {
  const expected = process.env.INTERNAL_API_TOKEN;
  if (!expected || expected.length < 16) return false;
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = createHash("sha256").update(got).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
