import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.SITE_URL;
  if (!origin) return [];
  return ["/", "/game", "/play", "/playtest", "/updates", "/creator-kit", "/feedback", "/bugs", "/ideas", "/insider", "/community", "/privacy", "/terms"].map(path => ({ url: new URL(path, origin).toString(), changeFrequency: "monthly" as const, priority: path === "/" ? 1 : 0.6 }));
}
