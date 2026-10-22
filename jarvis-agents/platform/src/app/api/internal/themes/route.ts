import { internalAllowed } from "@/lib/internal-auth";
import { THEMES } from "@/themes";

// which designs exist for which niche, so MARK never asks for one that doesn't
export async function GET(req: Request) {
  if (!internalAllowed(req)) return Response.json({ error: "unauthorised" }, { status: 401 });
  return Response.json(Object.values(THEMES).map(({ name, niche, label }) => ({ name, niche, label })));
}
