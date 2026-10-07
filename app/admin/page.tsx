import type { Metadata } from "next";
import { env } from "cloudflare:workers";
import Link from "next/link";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { SiteHeader } from "@/components/site-shell";
import { AdminStatus } from "@/components/admin-status";
export const metadata: Metadata = { title: "Admin", robots: { index:false, follow:false } };
export const dynamic = "force-dynamic";
type Row = Record<string, unknown>;
const q = async (db:D1Database,sql:string)=> (await db.prepare(sql).all()).results as Row[];
export default async function AdminPage(){
  const user = await requireChatGPTUser("/admin");
  const allow = String((env as {ADMIN_EMAIL?:string}).ADMIN_EMAIL || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (!allow || user.email.toLowerCase()!==allow) return <><SiteHeader/><main className="container content-section"><h1>ADMIN ACCESS NOT CONFIGURED</h1><p>Set ADMIN_EMAIL to the authorized studio account. Signed in as {user.email}.</p><Link href="/">Back to site</Link></main></>;
  const db=(env as {DB?:D1Database}).DB;
  if(!db)return <><SiteHeader/><main className="container content-section"><h1>DATABASE UNAVAILABLE</h1><p>Check the DB binding.</p></main></>;
  let data: Row[][] | null = null;
  try {
    data = await Promise.all([
      q(db,"SELECT (SELECT count(*) FROM events WHERE kind='page_view') AS visitors, (SELECT count(*) FROM testers) AS testers, (SELECT count(*) FROM feedback) AS feedback, (SELECT count(*) FROM bugs) AS bugs, (SELECT count(*) FROM ideas) AS ideas, (SELECT count(*) FROM subscribers) AS subscribers, (SELECT count(*) FROM events WHERE kind='play_click') AS playClicks"),
      q(db,"SELECT display_name AS name,email,device,os,source,created_at AS date FROM testers ORDER BY created_at DESC LIMIT 30"),
      q(db,"SELECT rating,enjoyed,improve,comment,version,media_key AS mediaKey,created_at AS date FROM feedback ORDER BY created_at DESC LIMIT 30"),
      q(db,"SELECT id,category,severity,status,version,device,os,description,media_key AS mediaKey,created_at AS date FROM bugs ORDER BY created_at DESC LIMIT 30"),
      q(db,"SELECT id,title,category,status,votes,created_at AS date FROM ideas ORDER BY votes DESC LIMIT 30"),
      q(db,"SELECT email,created_at AS date FROM subscribers ORDER BY created_at DESC LIMIT 30"),
      q(db,"SELECT page,platform,source,count(*) AS count FROM events WHERE kind='page_view' GROUP BY page,platform,source ORDER BY count DESC LIMIT 30"),
    ]);
  } catch(error){console.error("admin dashboard",error)}
  if(!data) return <><SiteHeader/><main className="container content-section"><h1>DASHBOARD UNAVAILABLE</h1><p>Apply the local D1 migration, then reload.</p></main></>;
  const [summary,testers,feedback,bugs,ideas,subscribers,events] = data;
  const metrics=summary[0]||{};
  return <><SiteHeader/><main className="container admin-page"><div className="admin-top"><div><p className="kicker">{"// "}STUDIO CONTROL</p><h1>RATEL RAGE HQ</h1><p>Signed in as {user.email}. Numbers reflect this site’s saved data, not game telemetry.</p></div><Link href="/">VIEW SITE ↗</Link></div><div className="metric-grid">{[["PAGE VIEWS",metrics.visitors],["PLAY CLICKS",metrics.playClicks],["PLAYTESTERS",metrics.testers],["FEEDBACK",metrics.feedback],["BUGS",metrics.bugs],["IDEAS",metrics.ideas],["INSIDERS",metrics.subscribers]].map(([label,value])=><div key={String(label)}><span>{String(label)}</span><strong>{String(value??0)}</strong></div>)}</div>
      <AdminTable title="PLAYTESTERS" headers={["NAME","EMAIL","DEVICE","OS","SOURCE","DATE"]} rows={testers.map(x=>[x.name,x.email,x.device,x.os,x.source,x.date])}/>
      <AdminTable title="FEEDBACK" headers={["RATING","POSITIVE","IMPROVE","COMMENT","BUILD","MEDIA","DATE"]} rows={feedback.map(x=>[x.rating,x.enjoyed,x.improve,x.comment,x.version,x.mediaKey,x.date])}/>
      <section className="admin-section"><h2>BUG REPORTS</h2><div className="table-scroll"><table className="data-table"><thead><tr>{["CATEGORY","SEVERITY","DESCRIPTION","BUILD","DEVICE","MEDIA","STATUS","DATE"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{bugs.map(x=><tr key={String(x.id)}><td>{String(x.category)}</td><td>{String(x.severity)}</td><td>{String(x.description)}</td><td>{String(x.version)}</td><td>{String(x.device)} / {String(x.os)}</td><td><MediaLink value={x.mediaKey}/></td><td><AdminStatus type="bug" id={String(x.id)} current={String(x.status)}/></td><td>{String(x.date)}</td></tr>)}</tbody></table></div>{!bugs.length&&<p className="muted">No bug reports yet.</p>}</section>
      <section className="admin-section"><h2>FEATURE IDEAS</h2><div className="table-scroll"><table className="data-table"><thead><tr>{["IDEA","CATEGORY","VOTES","STATUS","DATE"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{ideas.map(x=><tr key={String(x.id)}><td>{String(x.title)}</td><td>{String(x.category)}</td><td>{String(x.votes)}</td><td><AdminStatus type="idea" id={String(x.id)} current={String(x.status)}/></td><td>{String(x.date)}</td></tr>)}</tbody></table></div>{!ideas.length&&<p className="muted">No ideas yet.</p>}</section>
      <AdminTable title="INSIDER LIST" headers={["EMAIL","DATE"]} rows={subscribers.map(x=>[x.email,x.date])}/>
      <AdminTable title="PAGE VIEWS BY SOURCE" headers={["PAGE","PLATFORM","SOURCE","VIEWS"]} rows={events.map(x=>[x.page,x.platform,x.source,x.count])}/>
    </main></>;
}
function AdminTable({title,headers,rows}:{title:string;headers:string[];rows:unknown[][]}){return <section className="admin-section"><h2>{title}</h2><div className="table-scroll"><table className="data-table"><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{typeof cell==="string"&&cell.startsWith("reports/")?<MediaLink value={cell}/>:String(cell??"")}</td>)}</tr>)}</tbody></table></div>{!rows.length&&<p className="muted">No records yet.</p>}</section>}
function MediaLink({value}:{value:unknown}){return value?<a href={`/api/admin/media?key=${encodeURIComponent(String(value))}`}>OPEN ↗</a>:<span>—</span>}
