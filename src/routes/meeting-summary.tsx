import { createFileRoute } from "@tanstack/react-router";
import { ToolPanel } from "@/components/ToolPanel";

export const Route = createFileRoute("/meeting-summary")({
  component: () => (
    <ToolPanel
      tool="meeting"
      title="Meeting Summariser"
      subtitle="Paste raw notes or a transcript. Get a TL;DR, decisions, action items and risks."
      placeholder="Paste your meeting notes or transcript here…"
    />
  ),
  head: () => ({ meta: [{ title: "Meeting Summariser · AI HR Assistant" }] }),
});
