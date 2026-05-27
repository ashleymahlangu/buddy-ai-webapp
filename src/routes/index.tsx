import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  ListChecks,
  BookOpen,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  CalendarClock,
  Mic,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "HRFlow AI — Smart AI tools for people teams" },
      {
        name: "description",
        content:
          "HRFlow AI is your AI HR co-pilot: draft emails, summarise meetings, plan tasks, research topics, chat with Aria, talk to a voice assistant, and run a smart daily planner with reminders.",
      },
    ],
  }),
});

const tools = [
  {
    to: "/email-generator",
    icon: Mail,
    title: "Email Generator",
    desc: "Draft offers, rejections, onboarding notes and policy updates in seconds.",
  },
  {
    to: "/meeting-summary",
    icon: FileText,
    title: "Meeting Summariser",
    desc: "Turn raw notes into a clean TL;DR with decisions, owners and action items.",
  },
  {
    to: "/task-planner",
    icon: ListChecks,
    title: "Task Planner",
    desc: "Break an HR goal into phases, owners, effort and priorities.",
  },
  {
    to: "/daily-planner",
    icon: CalendarClock,
    title: "Smart Daily Planner",
    desc: "Add today's tasks, get an AI time-blocked schedule and browser reminders.",
  },
  {
    to: "/research",
    icon: BookOpen,
    title: "Research Assistant",
    desc: "Get a structured briefing on any people, talent or workplace topic.",
  },
] as const;

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-semibold tracking-tight">HRFlow AI</span>
          </div>
          <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:inline-flex">
            <ShieldCheck className="h-4 w-4" /> Responsible AI · human review required
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" /> Powered by AI
        </span>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          HRFlow AI — your everyday co-pilot for people teams
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Five focused tools for hiring, onboarding and performance — plus{" "}
          <span className="font-medium text-foreground">Aria</span>, your floating HR chatbot,
          and a hands-free <span className="font-medium text-foreground">Voice Assistant</span>.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            Bottom-right · chat with Aria
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
            <Mic className="h-3.5 w-3.5 text-foreground" />
            Bottom-left · talk to the Voice HR Assistant
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map(({ to, icon: Icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            <span className="mt-4 inline-block text-sm font-medium text-primary">
              Open tool →
            </span>
          </Link>
        ))}
      </section>

      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Built with responsible AI in mind
          </h2>
          <div className="mt-4 grid gap-6 text-sm text-muted-foreground sm:grid-cols-3">
            <p><strong className="text-foreground">Human in the loop.</strong> Every output is a draft — review before sending or deciding.</p>
            <p><strong className="text-foreground">No confidential data.</strong> Avoid pasting PII or salary data into prompts.</p>
            <p><strong className="text-foreground">Bias-aware prompts.</strong> System prompts steer toward neutral, inclusive language.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
