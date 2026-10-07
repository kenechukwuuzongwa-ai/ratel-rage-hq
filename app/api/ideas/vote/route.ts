import { env } from "cloudflare:workers";
import { rateLimit, rateRules, tooMany } from "@/lib/rate-limit";
type Bindings = { DB?: D1Database };
export async function POST(request: Request) {
  const db = (env as Bindings).DB;
  if (!db) return Response.json({ error: "Voting is unavailable." }, { status: 503 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Invalid origin." }, { status: 403 });
  const verdict = await rateLimit(request, rateRules.vote);
  if (!verdict.ok) return tooMany(verdict, "Too many votes from this connection. Try again later.");
  const { ideaId } = await request.json() as { ideaId?: string };
  if (!ideaId || !/^[0-9a-f-]{36}$/i.test(ideaId)) return Response.json({ error: "Invalid idea." }, { status: 400 });
  const voter = request.headers.get("cookie")?.match(/(?:^|; )rr_voter=([0-9a-f-]{36})/i)?.[1] || crypto.randomUUID();
  try {
    const idea = await db.prepare("SELECT id FROM ideas WHERE id=? AND status IN ('suggested','planned','in_development')").bind(ideaId).first();
    if (!idea) return Response.json({ error: "Idea not found." }, { status: 404 });
    const result = await db.prepare("INSERT INTO idea_votes (id,idea_id,voter) VALUES (?,?,?) ON CONFLICT(idea_id,voter) DO NOTHING").bind(crypto.randomUUID(), ideaId, voter).run();
    if (result.meta.changes) await db.prepare("UPDATE ideas SET votes=votes+1 WHERE id=?").bind(ideaId).run();
    return Response.json({ ok: true, voted: !!result.meta.changes }, { headers: { "Set-Cookie": `rr_voter=${voter}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000${new URL(request.url).protocol === "https:" ? "; Secure" : ""}` } });
  } catch (error) { console.error(error); return Response.json({ error: "Vote could not be saved." }, { status: 500 }); }
}
