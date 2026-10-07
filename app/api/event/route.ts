import { env } from "cloudflare:workers";
import { rateLimit, rateRules } from "@/lib/rate-limit";
type Bindings = { DB?: D1Database };
const allowed = ["page_view", "play_click", "creator_download"];
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403 });
  const db = (env as Bindings).DB;
  if (!db) return new Response(null, { status: 503 });
  const verdict = await rateLimit(request, rateRules.event);
  if (!verdict.ok) return new Response(null, { status: 429, headers: { "Retry-After": String(verdict.retryAfter) } });
  try {
    const data = await request.json() as Record<string, unknown>;
    const kind = String(data.kind ?? "");
    if (!allowed.includes(kind)) return new Response(null, { status: 400 });
    const page = String(data.page ?? "").slice(0, 120);
    const platform = String(data.platform ?? "").slice(0, 20);
    const source = String(data.source ?? "").slice(0, 100);
    await db.prepare("INSERT INTO events (id,kind,page,platform,source) VALUES (?,?,?,?,?)").bind(crypto.randomUUID(),kind,page,platform,source).run();
    await db.prepare("DELETE FROM events WHERE created_at < datetime('now','-90 days')").run();
    return new Response(null, { status: 204 });
  } catch (error) { console.error("analytics error",error); return new Response(null,{status:500}); }
}
