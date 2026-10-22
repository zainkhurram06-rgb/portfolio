// POST a whole business (content, services, team, hours, owner) and get back
// its website and dashboard login. This is how MARK turns a lead into a demo.

import { ZodError } from "zod";
import { createBusiness } from "@/lib/business";
import { internalAllowed } from "@/lib/internal-auth";
import { THEMES } from "@/themes";

export async function POST(req: Request) {
  if (!internalAllowed(req)) return Response.json({ error: "unauthorised" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: "send JSON" }, { status: 400 });
  if (body.theme && !THEMES[body.theme]) {
    return Response.json({ error: `unknown theme ${body.theme}`, themes: Object.keys(THEMES) }, { status: 400 });
  }
  try {
    const { business, owner } = await createBusiness(body);
    const root = process.env.ROOT_DOMAIN ?? "localhost:3000";
    const origin = new URL(req.url).origin;
    return Response.json({
      id: business.id,
      slug: business.slug,
      site: `${origin}/s/${business.slug}`,
      subdomain: `https://${business.slug}.${root}`,
      dashboard: `${origin}/admin`,
      login: owner,
    }, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) {
      return Response.json({ error: "invalid business", issues: e.issues.map((i) => `${i.path.join(".")}: ${i.message}`) }, { status: 422 });
    }
    throw e;
  }
}
