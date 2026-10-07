import { env } from "cloudflare:workers";
import { isAdmin } from "@/lib/admin-auth";
export async function GET(request: Request) {
  if (!await isAdmin()) return new Response("Forbidden", { status: 403 });
  const key = new URL(request.url).searchParams.get("key") || "";
  if (!/^reports\/[0-9a-f-]{36}\.(png|jpg|webp|mp4|webm)$/i.test(key)) return new Response("Invalid media", { status: 400 });
  const bucket = (env as { BUCKET?: R2Bucket }).BUCKET;
  if (!bucket) return new Response("Storage unavailable", { status: 503 });
  const object = await bucket.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, { headers: { "Content-Type": object.httpMetadata?.contentType || "application/octet-stream", "Content-Disposition": `attachment; filename="${key.split("/").at(-1)}"`, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store" } });
}
