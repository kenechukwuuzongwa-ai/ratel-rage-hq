"use client";
import { useState } from "react";
export function AdminStatus({ type, id, current }: { type: "bug" | "idea"; id: string; current: string }) {
  const [status,setStatus]=useState(current), [busy,setBusy]=useState(false), [error,setError]=useState("");
  const choices=type==="bug"?["open","investigating","fixed"]:["suggested","planned","in_development","hidden"];
  async function change(next:string){setBusy(true);setError("");try{const r=await fetch("/api/admin/status",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,id,status:next})});if(!r.ok)throw new Error("Could not update status.");setStatus(next)}catch(e){setError(e instanceof Error?e.message:"Update failed.")}finally{setBusy(false)}}
  return <div><select aria-label={`Status for ${type}`} value={status} disabled={busy} onChange={e=>void change(e.target.value)}>{choices.map(c=><option key={c} value={c}>{c.replaceAll("_"," ")}</option>)}</select>{error&&<small role="alert">{error}</small>}</div>;
}
