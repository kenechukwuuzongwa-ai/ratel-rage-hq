import type { Metadata } from "next";
import { PageFrame } from "@/components/page-frame";
import { SubmissionForm } from "@/components/submission-form";
export const metadata: Metadata = { title: "Report a Bug", description: "Report a Ratel Rage bug with build, device, severity, and reproduction details.", alternates: { canonical: "/bugs" } };
export default function BugsPage(){return <PageFrame kicker="BUG REPORT" title="FOUND A GLITCH?" intro="Give us enough detail to reproduce it: what you did, what happened, your build, and your device."><section className="content-section container"><SubmissionForm kind="bug"/></section></PageFrame>}
