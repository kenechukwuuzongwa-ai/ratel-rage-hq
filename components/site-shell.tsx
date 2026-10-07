"use client";
import Link from "next/link";
import { useState } from "react";
import { PageTracker } from "./page-tracker";

const links = [["THE GAME", "/game"], ["CHARACTERS", "/game#characters"], ["HOW TO PLAY", "/game#controls"], ["UPDATES", "/updates"], ["COMMUNITY", "/community"]];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <><PageTracker/><header className="site-header"><div className="container header-inner"><Link className="brand" href="/" aria-label="Ratel Rage home" onClick={() => setOpen(false)}><img src="/media/logo.svg" alt="Ratel Rage" /></Link><nav className={open ? "main-nav open" : "main-nav"} aria-label="Main navigation">{links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}<Link className="mobile-play" href="/play" onClick={() => setOpen(false)}>PLAY THE GAME ↗</Link></nav><Link className="header-play" href="/play">PLAY THE GAME <span>↗</span></Link><button className="menu-toggle" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}><span/><span/><span/></button></div></header></>;
}

export function SiteFooter() {
  return <footer className="footer"><div className="container"><div className="footer-top"><div><img className="footer-logo" src="/media/logo.svg" alt="Ratel Rage" /><p>A Nigerian-inspired arcade brawler in development.</p></div><div className="footer-links"><div><b>EXPLORE</b><Link href="/game">The game</Link><Link href="/play">Play</Link><Link href="/updates">Updates</Link><Link href="/creator-kit">Creator kit</Link></div><div><b>GET INVOLVED</b><Link href="/playtest">Playtest</Link><Link href="/feedback">Feedback</Link><Link href="/bugs">Report a bug</Link><Link href="/ideas">Feature ideas</Link><Link href="/community">Community</Link></div><div><b>INFO</b><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} RATEL RAGE. ALL RIGHTS RESERVED.</span><span>MADE IN NIGERIA · BUILD IN PROGRESS</span></div></div></footer>;
}
