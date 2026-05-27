import { createFileRoute } from "@tanstack/react-router";
import { ToolPanel } from "@/components/ToolPanel";

export const Route = createFileRoute("/task-planner")({
  component: () => (
    <ToolPanel
      tool="tasks"
      title="Task Planner"
      subtitle="Describe your HR project or goal. Get a structured plan with phases, owners, effort and priority."
      placeholder="e.g. Roll out a new performance review framework across a 120-person company in 8 weeks."
      examples={[
        "Plan onboarding for 10 new hires in 2 weeks",
        "Launch an employee engagement survey",
        "Migrate the company handbook to a new tool",
      ]}
    />
  ),
  head: () => ({ meta: [{ title: "Task Planner · AI HR Assistant" }] }),
});
