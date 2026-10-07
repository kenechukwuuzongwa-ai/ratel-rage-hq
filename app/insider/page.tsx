import type { Metadata } from "next";
import { PageFrame } from "@/components/page-frame";
import { SubmissionForm } from "@/components/submission-form";
export const metadata: Metadata = { title: "Ratel Rage Insider", description: "Join the early Ratel Rage community for playtest invitations and development updates.", alternates: { canonical: "/insider" } };
export default function InsiderPage(){return <PageFrame kicker="RATEL RAGE INSIDER" title="STAY IN THE FIGHT." intro="Get invited when validated playtest builds and meaningful development updates are ready. No invented launch dates or spam."><section className="content-section container"><SubmissionForm kind="insider"/></section></PageFrame>}
