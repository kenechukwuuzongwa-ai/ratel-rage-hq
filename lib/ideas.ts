import { env } from "cloudflare:workers";
export type Idea = { id: string; name: string; category: string; title: string; description: string; status: string; votes: number; createdAt: string };
const listSql = "SELECT id,name,category,title,description,status,votes,created_at AS createdAt FROM ideas WHERE status IN ('suggested','planned','in_development') ORDER BY votes DESC, created_at DESC LIMIT 100";
export async function listIdeas(): Promise<Idea[] | null> {
  const db = (env as { DB?: D1Database }).DB;
  if (!db) return null;
  try { return (await db.prepare(listSql).all()).results as unknown as Idea[]; }
  catch (error) { console.error("ideas query failed", error); return null; }
}
