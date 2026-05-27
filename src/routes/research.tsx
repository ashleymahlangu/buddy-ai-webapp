import { createFileRoute } from "@tanstack/react-router";
import { ToolPanel } from "@/components/ToolPanel";

export const Route = createFileRoute("/research")({
  component: () => (
    <ToolPanel
      tool="research"
      title="Research Assistant"
      subtitle="Get a balanced, structured briefing on any people, talent, or workplace topic."
      placeholder="e.g. Brief me on best practices for hybrid work policies in 2026."
      examples={[
        "Pros and cons of pay transparency",
        "Trends in early-career retention",
        "Frameworks for measuring employee engagement",
      ]}
    />
  ),
  head: () => ({ meta: [{ title: "Research Assistant · AI HR Assistant" }] }),
});
