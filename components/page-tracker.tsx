"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
export function PageTracker(){
  const pathname = usePathname();
  useEffect(()=>{
    if (!pathname || pathname.startsWith("/admin")) return;
    let source="direct";
    try { if(document.referrer) source=new URL(document.referrer).hostname || "direct"; } catch {}
    const platform=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)?"mobile":"desktop";
    void fetch("/api/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"page_view",page:pathname,platform,source}),keepalive:true});
  },[pathname]);
  return null;
}
