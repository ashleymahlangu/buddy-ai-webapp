import { createFileRoute } from "@tanstack/react-router";
import { ToolPanel } from "@/components/ToolPanel";

export const Route = createFileRoute("/email-generator")({
  component: () => (
    <ToolPanel
      tool="email"
      title="Email Generator"
      subtitle="Describe the situation, audience, and tone. The assistant drafts a polished HR email."
      placeholder="e.g. Write a warm welcome email to a new software engineer starting next Monday. Include first-day logistics and a friendly tone."
      examples={[
        "Offer letter follow-up for a senior designer",
        "Polite rejection after final-round interview",
        "Reminder to complete annual performance review",
      ]}
    />
  ),
  head: () => ({ meta: [{ title: "Email Generator · AI HR Assistant" }] }),
});
