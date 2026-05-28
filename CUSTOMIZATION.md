# HRFlow AI — Quick Customization Cheat Sheet

> Don't read the whole README — just find what you want to change below.

---

## Change the app name / branding

| What | File | Look for |
|------|------|----------|
| Browser tab title | `src/routes/__root.tsx` | `title:` inside `head` |
| Home page header | `src/routes/index.tsx` | `HRFlow AI` text |
| Logo icon | `src/routes/index.tsx` | `<Sparkles className...` inside header div |

---

## Change colors

Open `src/styles.css`. The main color is `--primary` (currently emerald/teal).

```css
:root {
  --primary: oklch(0.42 0.09 168);  /* <-- change this value */
}
```

Use a tool like [oklch.com](https://oklch.com) to pick new OKLCH values.

---

## Change Aria's personality

Open `src/lib/chat.functions.ts` → edit the `SYSTEM` string.

Make her more formal, more playful, or change her expertise area.

---

## Change Aria's welcome message

Open `src/components/FloatingHrChat.tsx` → edit the `WELCOME` constant.

---

## Change quick-reply chips in Aria

Open `src/components/FloatingHrChat.tsx` → edit the `QUICK_PROMPTS` array.

---

## Change how a tool generates output

Each tool's "personality" lives in `src/lib/ai.functions.ts`.

Look for the `TOOLS` object:

```typescript
const TOOLS = {
  email: { system: "..." },      // Email Generator
  meeting: { system: "..." },    // Meeting Summariser
  tasks: { system: "..." },      // Task Planner
  research: { system: "..." },   // Research Assistant
};
```

Edit the `system` string to change tone, rules, or output format.

---

## Change a tool page's title or placeholder

Open the route file (e.g. `src/routes/email-generator.tsx`) and edit the props passed to `<ToolPanel>`:

```tsx
<ToolPanel
  tool="email"
  title="Email Generator"          // <-- change this
  subtitle="Draft HR emails..."    // <-- change this
  placeholder="Paste your notes..." // <-- change this
  examples={[...]}                 // <-- change these
/>
```

---

## Change the Daily Planner AI rules

Open `src/lib/planner.functions.ts` → edit the `SYSTEM` string.

For example, change "front-load deep work in the morning" to "save mornings for meetings".

---

## Add a new tool page

1. Create `src/routes/my-tool.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { ToolPanel } from "@/components/ToolPanel";

export const Route = createFileRoute("/my-tool")({
  component: () => (
    <ToolPanel
      tool="email" // or add a new one in ai.functions.ts
      title="My Tool"
      subtitle="What this tool does"
      placeholder="Type something..."
    />
  ),
});
```

2. Add it to the dashboard in `src/routes/index.tsx` by adding an entry to the `tools` array.

3. Done — TanStack Router auto-registers the new page.

---

## Swap the AI model

Open any `.functions.ts` file and change the `model` field:

```typescript
model: "google/gemini-3-flash-preview",  // <-- change this
```

Available models depend on what's live on the Lovable AI Gateway.

---

## Change the voice language

Open `src/components/VoiceHrAssistant.tsx` → find `rec.lang = "en-US"` and change to your language code (e.g. `"es-ES"`, `"fr-FR"`).
