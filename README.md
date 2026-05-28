# HRFlow AI

> Your everyday AI co-pilot for people teams. Draft emails, summarise meetings, plan tasks, research topics, chat with Aria, talk to a hands-free Voice Assistant, and run a Smart Daily Planner with browser reminders.

---

## What's Inside

HRFlow AI is a full-stack React web app built with modern, production-grade tooling. It ships with **7 HR tools** plus **2 floating AI widgets** that are available on every page.

### Tools (Pages)

| Tool | Route | What it does |
|------|-------|-------------|
| **Email Generator** | `/email-generator` | Draft offers, rejections, onboarding notes, policy updates |
| **Meeting Summariser** | `/meeting-summary` | Turn raw notes/transcripts into TL;DR + decisions + action items |
| **Task Planner** | `/task-planner` | Convert an HR project into phases, owners, effort, priorities |
| **Research Assistant** | `/research` | Get structured briefings on any people / talent / workplace topic |
| **Smart Daily Planner** | `/daily-planner` | Add tasks, get an AI time-blocked schedule + browser reminders |

### Floating Widgets (Global)

| Widget | Location | What it does |
|--------|----------|-------------|
| **Aria Chatbot** | Bottom-right corner | Floating conversational HR assistant with quick prompts |
| **Voice HR Assistant** | Bottom-left corner | Talk-to-type using your microphone; AI speaks the reply back |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [TanStack Start](https://tanstack.com/start) v1 (full-stack React, SSR/SSG) |
| Router | TanStack Router (file-based, type-safe) |
| Styling | Tailwind CSS v4 + custom design tokens in `src/styles.css` |
| UI Components | shadcn/ui primitives (Radix + Tailwind) |
| State / Data | TanStack Query (React Query) |
| Server Logic | `createServerFn` (typed RPC, runs on the edge) |
| AI Backend | [Lovable AI Gateway](https://ai.gateway.lovable.dev) — Gemini 3 Flash |
| Runtime | Cloudflare Worker (via Vite + `@cloudflare/vite-plugin`) |
| Icons | [Lucide React](https://lucide.dev) |
| Validation | Zod |

---

## Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Set your AI API key (required for AI features)
#    Add this to a .env file in the project root:
#    LOVABLE_API_KEY=your_key_here

# 3. Run the dev server
bun run dev

# 4. Open http://localhost:3000
```

Other useful commands:

```bash
bun run build          # Production build
bun run build:dev      # Development build
bun run preview        # Preview production build locally
bun run lint           # Run ESLint
bun run format         # Run Prettier
```

---

## Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui primitives (Button, Card, Input, etc.)
│   ├── FloatingHrChat.tsx     # Aria chatbot widget (bottom-right)
│   ├── VoiceHrAssistant.tsx   # Voice assistant widget (bottom-left)
│   └── ToolPanel.tsx          # Shared layout for all 5 tool pages
├── lib/
│   ├── ai.functions.ts        # Server functions for the 5 tools
│   ├── chat.functions.ts      # Server function for Aria chat
│   └── planner.functions.ts   # Server function for daily planner AI
├── routes/
│   ├── __root.tsx             # Root layout (head tags, global widgets)
│   ├── index.tsx              # Home / dashboard page
│   ├── email-generator.tsx
│   ├── meeting-summary.tsx
│   ├── task-planner.tsx
│   ├── research.tsx
│   └── daily-planner.tsx
├── styles.css                 # Design tokens (colors, dark mode, radius)
├── router.tsx                 # Router setup
├── start.ts                   # Server start config
└── server.ts                  # SSR entry / error wrapper
```

---

## Easy Editing Guide

> Want to change something? Here's exactly which file to edit.

### Branding & Colors

- **App name / title**: Edit `src/routes/__root.tsx` (meta tags) and `src/routes/index.tsx` (header).
- **Primary color (emerald/teal)**: Edit `src/styles.css` — look for `--primary: oklch(...)` inside `:root`.
- **Dark mode colors**: Edit the same file, inside the `.dark { }` block.
- **Border radius**: Change `--radius` at the top of `src/styles.css`.

### Aria (Floating Chatbot)

- **Welcome message**: `src/components/FloatingHrChat.tsx` → `WELCOME` constant.
- **Quick prompt chips**: Same file → `QUICK_PROMPTS` array.
- **Bot name**: Same file → "Aria" text in the header.
- **System personality**: `src/lib/chat.functions.ts` → `SYSTEM` string.

### Voice Assistant

- **Voice language**: `src/components/VoiceHrAssistant.tsx` → `rec.lang` (default `"en-US"`).
- **Placeholder prompt text**: Same file → text inside the transcript box.
- **System replies**: Uses the same `chatWithAria` server function as Aria (see above).

### The 5 AI Tools

All tools share the same server function (`runAiTool`) but have **different system prompts**.

| Tool | System Prompt File | UI Page File |
|------|-------------------|--------------|
| Email Generator | `src/lib/ai.functions.ts` → `TOOLS.email` | `src/routes/email-generator.tsx` |
| Meeting Summariser | `src/lib/ai.functions.ts` → `TOOLS.meeting` | `src/routes/meeting-summary.tsx` |
| Task Planner | `src/lib/ai.functions.ts` → `TOOLS.tasks` | `src/routes/task-planner.tsx` |
| Research Assistant | `src/lib/ai.functions.ts` → `TOOLS.research` | `src/routes/research.tsx` |

To change how an AI tool *behaves* (tone, rules, output format), edit the `system` string in `src/lib/ai.functions.ts`.

To change the *UI* (title, subtitle, placeholder text, example prompts), edit the route file directly.

### Smart Daily Planner

- **AI schedule rules**: `src/lib/planner.functions.ts` → `SYSTEM` string.
- **UI labels / layout**: `src/routes/daily-planner.tsx`.
- **localStorage key**: `STORAGE_KEY` constant in `daily-planner.tsx`.

### Home Page (Dashboard)

- **Tool cards**: `src/routes/index.tsx` → `tools` array.
- **Hero text / tagline**: Same file, inside the `<section>`.
- **Responsible AI footer**: Same file, bottom section.

### Global Layout

- **Add a new global widget**: Import it in `src/routes/__root.tsx` and render it inside `RootComponent`.
- **Change page titles**: Edit the `head: () => ({ meta: [...] })` block in any route file.
- **SEO (Open Graph)**: Edit `meta` in `__root.tsx` or individual route files.

---

## Architecture Notes

### AI Calls

All AI runs through the Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`) using the `google/gemini-3-flash-preview` model. Calls happen in **server functions** (`createServerFn`), which means:

- The API key stays server-side (never exposed to the browser).
- You can swap the model by changing the `model` field in the fetch body.
- Rate limits (429) and credit exhaustion (402) are handled gracefully.

### Data Storage

- **No database required** by default. All state is in-memory or `localStorage`.
- The Daily Planner persists tasks to `localStorage`.
- If you add a database later, [Lovable Cloud](https://docs.lovable.dev/features/cloud) gives you PostgreSQL + auth out of the box.

### Adding a New Page

1. Create a file in `src/routes/` with the URL-friendly name (e.g. `interview-guide.tsx`).
2. Use the `createFileRoute` pattern you see in existing pages.
3. The TanStack Router plugin auto-registers it — no manual routing needed.

### Adding a New AI Tool

1. Add a new entry to `TOOLS` in `src/lib/ai.functions.ts`.
2. Add a new `z.enum` value to `InputSchema` if you want strict typing.
3. Create a route file that uses `<ToolPanel tool="yourTool" ... />`.

---

## Environment Variables

| Variable | Purpose | Where |
|----------|---------|-------|
| `LOVABLE_API_KEY` | Powers all AI features | Server only (via `process.env`) |

In dev, create a `.env` file:

```
LOVABLE_API_KEY=your_api_key_here
```

In production, set this via your hosting platform's environment variable panel.

---

## Browser Support

- **Chrome / Edge / Safari / Firefox** — all modern browsers supported.
- **Voice Assistant** requires a browser with Web Speech API (best in Chrome/Edge).
- **Daily Planner reminders** use the Browser Notification API — users must grant permission.

---

## License

Built for responsible AI use. Always review AI-generated outputs before sending or acting on them. Never paste confidential employee PII or salary data into prompts.
