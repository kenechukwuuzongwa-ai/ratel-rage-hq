"use client";
export function TrackedPlayLink({ href }: { href: string }) {
  function track(){void fetch("/api/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"play_click",page:"/play",platform:/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)?"mobile":"desktop",source:"site"}),keepalive:true})}
  return <a className="button button-primary" href={href} target="_blank" rel="noopener noreferrer" onClick={track}>LAUNCH PROTOTYPE ↗</a>;
}
