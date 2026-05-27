import { createFileRoute } from "@tanstack/react-router";
import { ToolPanel } from "@/components/ToolPanel";

export const Route = createFileRoute("/chat")({
  component: () => (
    <ToolPanel
      tool="chat"
      title="HR Chatbot"
      subtitle="Ask anything about HR best practices, processes, or people questions."
      placeholder="e.g. What's a good structure for a 30-60-90 onboarding plan?"
      examples={[
        "How should I handle a sensitive resignation?",
        "Explain probation reviews to a new manager",
        "Tips to reduce bias in interview scorecards",
      ]}
    />
  ),
  head: () => ({ meta: [{ title: "HR Chatbot · AI HR Assistant" }] }),
});
