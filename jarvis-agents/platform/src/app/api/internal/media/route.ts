// MARK uploads a lead's photos and videos here before building their demo.
//   POST multipart: folder=<lead key>, file=<the file>   ->   { url }

import { internalAllowed } from "@/lib/internal-auth";
import { MediaError, saveMedia } from "@/lib/media";

export async function POST(req: Request) {
  if (!internalAllowed(req)) return Response.json({ error: "unauthorised" }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const folder = form?.get("folder");
  if (!(file instanceof File) || typeof folder !== "string") return Response.json({ error: "send folder and file" }, { status: 400 });
  try {
    const path = await saveMedia(folder, file.name, new Uint8Array(await file.arrayBuffer()));
    return Response.json({ url: `${new URL(req.url).origin}${path}` }, { status: 201 });
  } catch (e) {
    if (e instanceof MediaError) return Response.json({ error: e.message }, { status: 422 });
    throw e;
  }
}
