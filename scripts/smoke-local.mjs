const base = "http://localhost:5173";
const marker = `codex-qa-${Date.now()}`;
async function send(kind, fields) {
  const form = new FormData(); form.set("kind", kind);
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  const response = await fetch(`${base}/api/submit`, { method: "POST", body: form });
  const data = await response.json();
  console.log(kind, response.status, data);
  if (!response.ok || !data.ok) throw new Error(`${kind} failed`);
}
await send("tester", { displayName: marker, email: `${marker}@example.invalid`, device: "QA phone", os: "Android QA", source: "local smoke test", consent: "yes" });
await send("insider", { email: `${marker}@example.invalid`, consent: "yes" });
await send("feedback", { rating: "4", comment: `${marker} feedback for local smoke test.`, version: "browser prototype" });
await send("bug", { category: "controls", severity: "low", description: `${marker}: local QA bug report to verify persistence.`, version: "browser prototype" });
await send("idea", { displayName: marker, category: "combat", title: `${marker} idea`, description: "A local QA idea to verify community submissions." });
const ideas = await (await fetch(`${base}/api/ideas`)).json();
const idea = ideas.ideas.find(item => item.title === `${marker} idea`);
if (!idea) throw new Error("Idea list missing saved idea");
const vote = await fetch(`${base}/api/ideas/vote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ideaId: idea.id }) });
const voted = await vote.json();
console.log("vote", vote.status, voted);
if (!voted.voted) throw new Error("Idea vote failed");
console.log("SMOKE_OK", marker, idea.id);
