import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { generateDailyPlan } from "@/lib/planner.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Bell,
  BellOff,
  Sparkles,
  Loader2,
  Clock,
} from "lucide-react";

type Priority = "low" | "med" | "high";
type Task = {
  id: string;
  title: string;
  priority: Priority;
  durationMin: number;
  remindAt?: string; // HH:MM
};

const STORAGE_KEY = "hrflow.daily.tasks.v1";

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/daily-planner")({
  component: DailyPlanner,
  head: () => ({
    meta: [
      { title: "Smart Daily Planner · HRFlow AI" },
      {
        name: "description",
        content:
          "An AI-powered smart daily planner and reminder tool for HR teams. Time-block your day and get nudges in your browser.",
      },
    ],
  }),
});

function DailyPlanner() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("med");
  const [duration, setDuration] = useState(30);
  const [remindAt, setRemindAt] = useState("");
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(18);
  const [plan, setPlan] = useState("");
  const [notifGranted, setNotifGranted] = useState(false);

  const fn = useServerFn(generateDailyPlan);
  const mutation = useMutation({
    mutationFn: () =>
      fn({
        data: {
          tasks: tasks.map((t) => ({
            title: t.title,
            priority: t.priority,
            durationMin: t.durationMin,
          })),
          startHour,
          endHour,
        },
      }),
    onSuccess: (res) => setPlan(res.content),
    onError: (e: Error) => setPlan(`⚠️ ${e.message}`),
  });

  useEffect(() => {
    setTasks(loadTasks());
    if (typeof Notification !== "undefined") {
      setNotifGranted(Notification.permission === "granted");
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks]);

  // Reminder ticker — fires browser notifications when remindAt matches now.
  useEffect(() => {
    if (!notifGranted) return;
    const fired = new Set<string>();
    const id = setInterval(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const key = `${hh}:${mm}`;
      tasks.forEach((t) => {
        if (t.remindAt === key && !fired.has(t.id + key)) {
          fired.add(t.id + key);
          new Notification("HRFlow AI · Reminder", {
            body: `${t.title} (${t.durationMin} min, ${t.priority} priority)`,
          });
        }
      });
    }, 30_000);
    return () => clearInterval(id);
  }, [tasks, notifGranted]);

  const requestNotifs = async () => {
    if (typeof Notification === "undefined") return;
    const r = await Notification.requestPermission();
    setNotifGranted(r === "granted");
  };

  const addTask = () => {
    const t = title.trim();
    if (!t) return;
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: t,
        priority,
        durationMin: duration,
        remindAt: remindAt || undefined,
      },
    ]);
    setTitle("");
    setRemindAt("");
  };

  const totalMin = useMemo(() => tasks.reduce((s, t) => s + t.durationMin, 0), [tasks]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> All tools
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" /> HRFlow AI
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Smart Daily Planner
            </h1>
            <p className="mt-2 text-muted-foreground">
              Add your HR tasks for today. Get an AI-built time-blocked schedule and gentle
              browser reminders.
            </p>
          </div>
          <Button
            variant={notifGranted ? "outline" : "default"}
            onClick={requestNotifs}
            disabled={notifGranted}
          >
            {notifGranted ? (
              <>
                <Bell className="mr-2 h-4 w-4" /> Reminders on
              </>
            ) : (
              <>
                <BellOff className="mr-2 h-4 w-4" /> Enable reminders
              </>
            )}
          </Button>
        </div>

        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Add a task
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto_auto]">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="e.g. Prep interview kit for backend role"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="low">Low</option>
              <option value="med">Medium</option>
              <option value="high">High</option>
            </select>
            <Input
              type="number"
              min={5}
              max={480}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 30)}
              className="w-24"
              title="Minutes"
            />
            <Input
              type="time"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
              className="w-32"
              title="Remind at"
            />
            <Button onClick={addTask} disabled={!title.trim()}>
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>

          {tasks.length > 0 && (
            <div className="mt-6 divide-y divide-border rounded-lg border border-border">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">{t.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className={
                          t.priority === "high"
                            ? "rounded bg-destructive/15 px-1.5 py-0.5 text-destructive"
                            : t.priority === "med"
                              ? "rounded bg-primary/15 px-1.5 py-0.5 text-primary"
                              : "rounded bg-secondary px-1.5 py-0.5"
                        }
                      >
                        {t.priority}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {t.durationMin} min
                      </span>
                      {t.remindAt && (
                        <span className="inline-flex items-center gap-1">
                          <Bell className="h-3 w-3" /> {t.remindAt}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setTasks((p) => p.filter((x) => x.id !== t.id))}
                    className="rounded p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    aria-label="Remove task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-center gap-3 text-sm">
              <label className="text-muted-foreground">Day from</label>
              <Input
                type="number"
                min={5}
                max={20}
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="w-20"
              />
              <label className="text-muted-foreground">to</label>
              <Input
                type="number"
                min={6}
                max={23}
                value={endHour}
                onChange={(e) => setEndHour(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-xs text-muted-foreground">
                · {tasks.length} tasks · {totalMin} min total
              </span>
            </div>
            <Button
              onClick={() => mutation.mutate()}
              disabled={tasks.length === 0 || mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Planning
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Build smart schedule
                </>
              )}
            </Button>
          </div>
        </Card>

        {plan && (
          <Card className="mt-6 p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Your AI-built day
            </h2>
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground">
              {plan}
            </pre>
          </Card>
        )}
      </main>
    </div>
  );
}
