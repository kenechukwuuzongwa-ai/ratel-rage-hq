import { listIdeas } from "@/lib/ideas";
export async function GET() {
  const ideas = await listIdeas();
  if (!ideas) return Response.json({ ideas: [], error: "Ideas are unavailable." }, { status: 503 });
  return Response.json({ ideas });
}
