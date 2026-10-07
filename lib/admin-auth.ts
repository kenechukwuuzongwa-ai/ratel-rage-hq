import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
export async function isAdmin() {
  const user = await getChatGPTUser();
  const allow = String((env as { ADMIN_EMAIL?: string }).ADMIN_EMAIL || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  return !!user && !!allow && user.email.toLowerCase() === allow;
}
