import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TaskSchema = z.object({
  title: z.string().min(1).max(200),
  priority: z.enum(["low", "med", "high"]).optional(),
  durationMin: z.number().min(5).max(480).optional(),
  notes: z.string().max(500).optional(),
});

const InputSchema = z.object({
  tasks: z.array(TaskSchema).min(1).max(30),
  startHour: z.number().min(5).max(20).default(9),
  endHour: z.number().min(6).max(23).default(18),
  context: z.string().max(500).optional(),
});

const SYSTEM = `You are an HR-focused smart daily planner.
Given a list of tasks, build a realistic time-blocked schedule for today between the user's start and end hour.
Rules:
- Front-load deep / high-priority HR work in the morning when focus is best.
- Cluster shallow tasks (emails, quick replies) into 1–2 batched blocks.
- Insert a 30 min lunch break and 2 short 10 min breaks.
- Respect provided durations; if missing, estimate reasonably.
- Output ONLY valid markdown with two sections:
  ## Schedule
  A clean table with columns: Time | Task | Why now
  ## Coaching
  3 short bullets on focus, energy, and one HR-specific tip for the day.
Never invent tasks the user didn't give you.`;

export const generateDailyPlan = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = [
      `Working window: ${data.startHour}:00 – ${data.endHour}:00`,
      data.context ? `Context: ${data.context}` : "",
      "Tasks:",
      ...data.tasks.map(
        (t, i) =>
          `${i + 1}. ${t.title} [priority: ${t.priority ?? "med"}, est: ${
            t.durationMin ?? "?"
          } min]${t.notes ? ` — ${t.notes}` : ""}`,
      ),
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limit reached. Try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted.");
      const t = await res.text();
      console.error("planner ai error", res.status, t);
      throw new Error("The planner couldn't generate a schedule right now.");
    }

    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "";
    return { content };
  });
