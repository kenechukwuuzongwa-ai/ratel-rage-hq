import { env } from "cloudflare:workers";
import { rateLimit, rateRules, tooMany } from "@/lib/rate-limit";

type Bindings = { DB?: D1Database; BUCKET?: R2Bucket };
const bindings = env as Bindings;
const bad = (error: string, status = 400) => Response.json({ error }, { status });
const str = (form: FormData, key: string, max = 500) => String(form.get(key) ?? "").trim().replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f<>]/g, "").slice(0, max);
const email = (form: FormData) => str(form, "email", 254).toLowerCase();
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const list = (form: FormData, key: string, allowed: string[]) => JSON.stringify(form.getAll(key).map(String).filter(value => allowed.includes(value)).slice(0, 12));
const choices = (value: string, allowed: string[]) => allowed.includes(value);

async function upload(form: FormData): Promise<string | null> {
  const file = form.get("media");
  if (!(file instanceof File) || !file.size) return null;
  if (file.size > 8 * 1024 * 1024) throw new Error("Media must be 8 MB or smaller.");
  const ext = ({ "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "video/mp4": "mp4", "video/webm": "webm" } as Record<string, string>)[file.type];
  if (!ext) throw new Error("Use PNG, JPEG, WebP, MP4, or WebM media.");
  if (!bindings.BUCKET) throw new Error("Media upload is temporarily unavailable.");
  const key = `reports/${crypto.randomUUID()}.${ext}`;
  await bindings.BUCKET.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  return key;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return bad("Invalid request origin.", 403);
  if (Number(request.headers.get("content-length") ?? 0) > 9 * 1024 * 1024) return bad("Request is too large.", 413);
  if (!bindings.DB) return bad("Submissions are temporarily unavailable.", 503);
  const verdict = await rateLimit(request, rateRules.submit);
  if (!verdict.ok) return tooMany(verdict, "Too many submissions from this connection. Try again later.");
  try {
    const form = await request.formData();
    if (str(form, "website")) return Response.json({ ok: true });
    const kind = str(form, "kind", 20);
    const id = crypto.randomUUID();
    const db = bindings.DB;
    if (kind === "tester") {
      const name = str(form, "displayName", 80), address = email(form);
      if (name.length < 2 || !validEmail(address) || form.get("consent") !== "yes") return bad("Add your display name, a valid email, and consent.");
      await db.prepare("INSERT INTO testers (id,display_name,email,device,os,source,consent) VALUES (?,?,?,?,?,?,1) ON CONFLICT(email) DO UPDATE SET display_name=excluded.display_name,device=excluded.device,os=excluded.os,source=excluded.source")
        .bind(id, name, address, str(form, "device", 100), str(form, "os", 100), str(form, "source", 100)).run();
      return Response.json({ ok: true, message: "Registration saved. Playtest invitations can be sent once a validated build and email channel are ready." });
    }
    if (kind === "insider") {
      const address = email(form);
      if (!validEmail(address) || form.get("consent") !== "yes") return bad("Add a valid email and consent.");
      await db.prepare("INSERT INTO subscribers (id,email,consent) VALUES (?,?,1) ON CONFLICT(email) DO NOTHING").bind(id, address).run();
      return Response.json({ ok: true, message: "You’re on the Insider list." });
    }
    if (kind === "feedback") {
      const rating = Number(str(form, "rating", 1));
      const comment = str(form, "comment", 3000);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) return bad("Choose a rating and tell us about your experience.");
      const address = email(form);
      if (address && !validEmail(address)) return bad("Enter a valid email or leave it blank.");
      const mediaKey = await upload(form);
      await db.prepare("INSERT INTO feedback (id,email,rating,enjoyed,improve,comment,version,media_key) VALUES (?,?,?,?,?,?,?,?)")
        .bind(id, address || null, rating, list(form, "enjoyed", ["combat","characters","art","music","story","difficulty","level_design","controls"]), list(form, "improve", ["controls","combat","difficulty","performance","bugs","ai","ui","other"]), comment, str(form, "version", 60) || "browser prototype", mediaKey).run();
      return Response.json({ ok: true, message: "Feedback received. Thank you for testing Ratel Rage." });
    }
    if (kind === "bug") {
      const category = str(form, "category", 30), severity = str(form, "severity", 20), description = str(form, "description", 3000);
      if (!choices(category, ["controls", "combat", "performance", "audio", "visual", "crash", "other"]) || !choices(severity, ["low", "medium", "high", "critical"]) || description.length < 15) return bad("Choose a category and severity, and describe the bug in at least 15 characters.");
      const address = email(form);
      if (address && !validEmail(address)) return bad("Enter a valid email or leave it blank.");
      const mediaKey = await upload(form);
      await db.prepare("INSERT INTO bugs (id,email,category,description,severity,version,device,os,media_key) VALUES (?,?,?,?,?,?,?,?,?)")
        .bind(id, address || null, category, description, severity, str(form, "version", 60) || "browser prototype", str(form, "device", 100), str(form, "os", 100), mediaKey).run();
      return Response.json({ ok: true, message: "Bug report received. The details will help us reproduce it." });
    }
    if (kind === "idea") {
      const category = str(form, "category", 30), title = str(form, "title", 100), description = str(form, "description", 1000);
      if (!choices(category, ["characters", "combat", "levels", "story", "music", "controls", "ui", "performance", "other"]) || title.length < 5 || description.length < 15) return bad("Add a category, short title, and a description of at least 15 characters.");
      await db.prepare("INSERT INTO ideas (id,name,category,title,description) VALUES (?,?,?,?,?)")
        .bind(id, str(form, "displayName", 50) || "Player", category, title, description).run();
      return Response.json({ ok: true, message: "Idea posted for the community to consider." });
    }
    return bad("Unknown submission type.");
  } catch (error) {
    console.error("submission failed", error);
    return bad(error instanceof Error && /Media|Use PNG/.test(error.message) ? error.message : "We couldn’t save this yet. Please try again.", 500);
  }
}
