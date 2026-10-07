import { env } from "cloudflare:workers";
import { isAdmin } from "@/lib/admin-auth";
export async function POST(request: Request) {
  if (!await isAdmin()) return Response.json({ error: "Forbidden" }, { status: 403 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const db = (env as { DB?: D1Database }).DB;
  if (!db) return Response.json({ error: "Database unavailable" }, { status: 503 });
  const { type, id, status } = await request.json() as { type?: string; id?: string; status?: string };
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: "Invalid record" }, { status: 400 });
  const allowed = type === "bug" ? ["open", "investigating", "fixed"] : type === "idea" ? ["suggested", "planned", "in_development", "hidden"] : [];
  if (!status || !allowed.includes(status)) return Response.json({ error: "Invalid status" }, { status: 400 });
  try {
    await db.prepare(`UPDATE ${type === "bug" ? "bugs" : "ideas"} SET status=? WHERE id=?`).bind(status,id).run();
    return Response.json({ ok:true });
  } catch(error) { console.error(error); return Response.json({ error: "Update failed" }, { status: 500 }); }
}
