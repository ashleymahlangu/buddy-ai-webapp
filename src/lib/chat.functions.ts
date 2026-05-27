import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM =
  "You are Aria, a warm, witty AI HR co-pilot embedded as a floating widget. " +
  "Keep replies short (under 120 words), conversational, and structured with light markdown when useful. " +
  "Cover HR best practices, policy reasoning, people questions, onboarding, performance, leave, and difficult conversations. " +
  "Be neutral, empathetic, and inclusive. If a question needs company-specific policy, say so and suggest who to ask. " +
  "Never invent confidential data, names, or statistics.";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
});

export const chatWithAria = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM }, ...data.messages],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("I'm getting a lot of questions right now — try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
      const text = await res.text();
      console.error("AI gateway error:", res.status, text);
      throw new Error("Something went wrong reaching the AI service.");
    }

    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "";
    return { content };
  });
