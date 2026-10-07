import type { Metadata } from "next";
import { PageFrame } from "@/components/page-frame";
import { SubmissionForm } from "@/components/submission-form";
import { IdeasBoard } from "@/components/ideas-board";
import { listIdeas } from "@/lib/ideas";
export const metadata: Metadata = { title: "Player Ideas", description: "Share and vote on Ratel Rage player ideas for characters, combat, levels, controls, and more.", alternates: { canonical: "/ideas" } };
export const dynamic = "force-dynamic";
export default async function IdeasPage(){const ideas = await listIdeas();return <PageFrame kicker="PLAYER IDEAS" title="WHAT’S NEXT?" intro="Got an idea that would make Ratel Rage hit harder? Make the case. Players can show support with a vote."><section className="content-section container"><p className="kicker">{"// "}FROM THE COMMUNITY</p><h2>THE IDEA<br/><span>BOARD.</span></h2><IdeasBoard initial={ideas ?? []} unavailable={!ideas}/></section><section className="content-section panel-section"><div className="container"><p className="kicker">{"// "}YOUR MOVE</p><h2>PUT IT<br/><span>FORWARD.</span></h2><SubmissionForm kind="idea"/></div></section></PageFrame>}
