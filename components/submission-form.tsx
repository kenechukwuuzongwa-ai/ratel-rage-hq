"use client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Kind = "tester" | "insider" | "feedback" | "bug" | "idea";
const title: Record<Kind,string> = { tester: "JOIN THE PLAYTEST", insider: "JOIN RATEL RAGE INSIDER", feedback: "SEND FEEDBACK", bug: "REPORT A BUG", idea: "SUGGEST AN IDEA" };
const nice = (s: string) => s.replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());

function Field({ name, label, type = "text", required = false, placeholder, maxLength }: { name: string; label: string; type?: string; required?: boolean; placeholder?: string; maxLength?: number }) {
  return <div className="field"><label htmlFor={name}>{label}{required ? " *" : ""}</label><Input id={name} name={name} type={type} required={required} placeholder={placeholder} maxLength={maxLength}/></div>;
}
function SelectField({ name, label, options, defaultValue }: { name: string; label: string; options: string[]; defaultValue?: string }) {
  return <div className="field"><label htmlFor={name}>{label} *</label><Select name={name} defaultValue={defaultValue} required><SelectTrigger id={name} className="site-select"><SelectValue placeholder="Choose one"/></SelectTrigger><SelectContent>{options.map(option=><SelectItem key={option} value={option}>{nice(option)}</SelectItem>)}</SelectContent></Select></div>;
}
function CheckGroup({ name, label, options }: { name: string; label: string; options: string[] }) {
  return <fieldset className="fieldset"><legend>{label}</legend><div className="check-grid">{options.map(option=><label key={option}><Checkbox name={name} value={option}/><span>{nice(option)}</span></label>)}</div></fieldset>;
}

export function SubmissionForm({ kind }: { kind: Kind }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(""); setOk(false);
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/submit", { method: "POST", body: new FormData(form) });
      const data = await response.json() as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "Submission failed. Please try again.");
      setMessage(data.message || "Saved."); setOk(true); form.reset();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Submission failed. Please try again."); }
    finally { setBusy(false); }
  }
  return <div className="form-shell"><form onSubmit={submit}><input type="hidden" name="kind" value={kind}/><div className="honeypot" aria-hidden="true"><label>Website<Input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    {kind === "tester" && <><Field name="displayName" label="DISPLAY NAME" required maxLength={80}/><Field name="email" label="EMAIL" type="email" required maxLength={254}/><div className="two-col compact"><Field name="device" label="DEVICE MODEL" placeholder="e.g. Galaxy A54" maxLength={100}/><Field name="os" label="OPERATING SYSTEM" placeholder="e.g. Android 15" maxLength={100}/></div><Field name="source" label="HOW DID YOU FIND RATEL RAGE?" maxLength={100}/><p className="smallprint">We use these details to invite testers and understand which devices need attention. No public Android build is being distributed yet.</p></>}
    {kind === "insider" && <><Field name="email" label="EMAIL" type="email" required maxLength={254}/><p className="smallprint">For playtest invitations and development updates when they are ready.</p></>}
    {kind === "feedback" && <><SelectField name="rating" label="OVERALL EXPERIENCE" options={["1","2","3","4","5"]}/><CheckGroup name="enjoyed" label="WHAT DID YOU ENJOY?" options={["combat","characters","art","music","story","difficulty","level_design","controls"]}/><CheckGroup name="improve" label="WHAT NEEDS WORK?" options={["controls","combat","difficulty","performance","bugs","ai","ui","other"]}/><div className="field"><label htmlFor="comment">TELL US MORE *</label><Textarea id="comment" name="comment" required maxLength={3000} placeholder="What happened, and what would make it better?"/></div><SelectField name="version" label="BUILD PLAYED" options={["browser prototype","android debug"]} defaultValue="browser prototype"/><Field name="email" label="EMAIL (OPTIONAL)" type="email" maxLength={254}/><MediaField/></>}
    {kind === "bug" && <><div className="two-col compact"><SelectField name="category" label="CATEGORY" options={["controls","combat","performance","audio","visual","crash","other"]}/><SelectField name="severity" label="SEVERITY" options={["low","medium","high","critical"]}/></div><div className="field"><label htmlFor="description">WHAT HAPPENED? *</label><Textarea id="description" name="description" required minLength={15} maxLength={3000} placeholder="What did you do? What did you expect? What actually happened?"/></div><SelectField name="version" label="BUILD" options={["browser prototype","android debug"]} defaultValue="browser prototype"/><div className="two-col compact"><Field name="device" label="DEVICE" maxLength={100}/><Field name="os" label="OPERATING SYSTEM" maxLength={100}/></div><Field name="email" label="EMAIL (OPTIONAL)" type="email" maxLength={254}/><MediaField/></>}
    {kind === "idea" && <><Field name="displayName" label="DISPLAY NAME (OPTIONAL)" maxLength={50}/><SelectField name="category" label="CATEGORY" options={["characters","combat","levels","story","music","controls","ui","performance","other"]}/><Field name="title" label="IDEA TITLE" required maxLength={100}/><div className="field"><label htmlFor="description">MAKE YOUR CASE *</label><Textarea id="description" name="description" required minLength={15} maxLength={1000} placeholder="What would this add to the game?"/></div><p className="smallprint">Suggestions and vote totals are signals, not promises or scientific polling.</p></>}
    {(kind === "tester" || kind === "insider") && <label className="consent"><Checkbox name="consent" value="yes" required/><span>I agree to receive the relevant Ratel Rage playtest or development emails. I can ask for removal at any time. See the <Link href="/privacy">Privacy Policy</Link>.</span></label>}
    <button className="button button-primary form-submit" type="submit" disabled={busy}>{busy ? "SAVING…" : title[kind]} <span>↗</span></button>
  </form>{message && <div className={ok ? "form-message success" : "form-message error"} role="status">{message}{ok && kind === "tester" && <p><Link href="/play">See current build status →</Link> · <Link href="/feedback">Send feedback →</Link></p>}</div>}</div>;
}

function MediaField(){return <div className="field"><label htmlFor="media">SCREENSHOT OR VIDEO (OPTIONAL)</label><Input id="media" name="media" type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"/><small>Up to 8 MB. Only the development team can access uploaded reports.</small></div>}
