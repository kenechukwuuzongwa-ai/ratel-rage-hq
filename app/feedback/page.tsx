import type { Metadata } from "next";
import { PageFrame } from "@/components/page-frame";
import { SubmissionForm } from "@/components/submission-form";
export const metadata: Metadata = { title: "Feedback", description: "Structured playtest feedback for Ratel Rage combat, art, controls, and performance.", alternates: { canonical: "/feedback" } };
export default function FeedbackPage(){return <PageFrame kicker="PLAYTEST FEEDBACK" title="HOW WAS THE FIGHT?" intro="Tell us what landed and what got in the way. The specifics help us make the next build better."><section className="content-section container"><SubmissionForm kind="feedback"/></section></PageFrame>}
