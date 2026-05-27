import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TOOLS = {
  email: {
    system:
      "You are an expert HR communications writer. Generate clear, warm, professional emails. " +
      "Use a friendly but precise tone, structure with greeting, body, and sign-off. " +
      "Avoid jargon, keep under 250 words unless asked, and never invent confidential facts.",
  },
  meeting: {
    system:
      "You are an HR meeting summariser. Given raw notes or a transcript, produce: " +
      "1) A 3-sentence TL;DR. 2) Key decisions. 3) Action items with owners and due dates if mentioned. " +
      "4) Risks or follow-ups. Use markdown headings. Do not fabricate names or dates not in the source.",
  },
  chat: {
    system:
      "You are an AI HR assistant for employees and HR teams. Answer questions about HR best practices, " +
      "policies, leave, onboarding, performance, and people processes. Be concise, empathetic, and neutral. " +
      "If a question requires company-specific policy you don't have, say so and suggest who to ask.",
  },
  tasks: {
    system:
      "You are an HR task planner. Convert a goal or project into a structured plan with: " +
      "Phase, Task, Owner (role), Estimated effort, and Priority. Output as a clean markdown table " +
      "followed by a short 'Risks & dependencies' section.",
  },
  research: {
    system:
      "You are an HR research assistant. Synthesise balanced, well-structured briefings on people/HR topics. " +
      "Use markdown with sections: Overview, Key points, Considerations for HR, Suggested next steps, " +
      "and a short 'Caveats' note reminding the reader to verify with primary sources. Do not invent statistics.",
  },
} as const;

type ToolKey = keyof typeof TOOLS;

const InputSchema = z.object({
  tool: z.enum(["email", "meeting", "chat", "tasks", "research"]),
  prompt: z.string().min(1).max(12000),
});

export const runAiTool = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY is not configured");

    const tool = TOOLS[data.tool as ToolKey];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: tool.system },
          { role: "user", content: data.prompt },
        ],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error("Rate limit reached. Please wait a moment and try again.");
      }
      if (res.status === 402) {
        throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
      }
      const text = await res.text();
      console.error("AI gateway error:", res.status, text);
      throw new Error("The AI service returned an error. Please try again.");
    }

    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "";
    return { content };
  });
