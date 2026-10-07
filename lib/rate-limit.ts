import { env } from "cloudflare:workers";

type Bindings = { DB?: D1Database; RATE_LIMIT_SALT?: string };
export type RateRule = { scope: string; limit: number; windowMs: number };
export type RateVerdict = { ok: boolean; retryAfter: number };

const minutes = (value: number) => value * 60 * 1000;

// Burst plus daily ceiling per scope. Humans fill one or two forms; these caps only bite on automated abuse.
export const rateRules = {
  submit: [{ scope: "submit", limit: 10, windowMs: minutes(10) }, { scope: "submit-day", limit: 30, windowMs: minutes(1440) }],
  vote: [{ scope: "vote", limit: 30, windowMs: minutes(10) }, { scope: "vote-day", limit: 120, windowMs: minutes(1440) }],
  event: [{ scope: "event", limit: 150, windowMs: minutes(10) }],
} satisfies Record<string, RateRule[]>;

// Cloudflare sets cf-connecting-ip at the edge and it cannot be spoofed. x-forwarded-for is only a fallback for
// non-Cloudflare hosts; a client can rotate it, so it is weaker, but it still costs an attacker a working proxy pool.
// With neither header present we return null and skip the limit rather than hash every visitor into one shared bucket,
// where a single abuser would lock the forms for everyone.
function clientAddress(request: Request) {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

// A salted, truncated digest of the caller that rotates with each window, so no raw IP is ever stored or recoverable.
async function caller(address: string, windowStart: number) {
  const salt = (env as Bindings).RATE_LIMIT_SALT || process.env.RATE_LIMIT_SALT || "ratel-rage-local-salt";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${windowStart}:${address}`));
  return Array.from(new Uint8Array(digest).slice(0, 12)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

// Fails open: if the counter table is unreachable the write it guards is already failing too, and a
// broken limiter should not take the forms down with it.
export async function rateLimit(request: Request, rules: RateRule[]): Promise<RateVerdict> {
  const db = (env as Bindings).DB;
  const address = clientAddress(request);
  if (!db || !address) return { ok: true, retryAfter: 0 };
  const now = Date.now();
  try {
    for (const rule of rules) {
      const windowStart = Math.floor(now / rule.windowMs) * rule.windowMs;
      const windowEnd = windowStart + rule.windowMs;
      const key = `${rule.scope}:${await caller(address, windowStart)}`;
      const row = await db.prepare("INSERT INTO rate_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count")
        .bind(key, new Date(windowEnd).toISOString()).first<{ count: number }>();
      if (Number(row?.count ?? 1) > rule.limit) return { ok: false, retryAfter: Math.max(1, Math.ceil((windowEnd - now) / 1000)) };
    }
    if (Math.random() < 0.05) await db.prepare("DELETE FROM rate_limits WHERE expires_at < ?").bind(new Date(now).toISOString()).run();
    return { ok: true, retryAfter: 0 };
  } catch (error) {
    console.error("rate limit check failed", error);
    return { ok: true, retryAfter: 0 };
  }
}

export const tooMany = (verdict: RateVerdict, message: string) =>
  Response.json({ error: message }, { status: 429, headers: { "Retry-After": String(verdict.retryAfter) } });
