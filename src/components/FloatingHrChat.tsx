import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { chatWithAria } from "@/lib/chat.functions";
import { Sparkles, Send, X, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "Draft a kind rejection email",
  "Run a fair 1:1",
  "Reduce interview bias",
  "Explain probation reviews",
];

const WELCOME: Msg = {
  role: "assistant",
  content:
    "Hi, I'm **Aria** — your floating HR co-pilot. Ask me anything about people, policy, or process. ✨",
};

export function FloatingHrChat() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fn = useServerFn(chatWithAria);

  const mutation = useMutation({
    mutationFn: (history: Msg[]) => fn({ data: { messages: history } }),
    onSuccess: (res) =>
      setMessages((m) => [...m, { role: "assistant", content: res.content || "…" }]),
    onError: (err: Error) =>
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${err.message}` }]),
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, mutation.isPending, open]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setDraft("");
    mutation.mutate(next.filter((m) => m !== WELCOME || messages.length > 1).slice(-12));
  };

  return (
    <>
      {/* Floating orb launcher */}
      <button
        type="button"
        aria-label={open ? "Close HR chat" : "Open HR chat"}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-5 right-5 z-50 group",
          "h-16 w-16 rounded-full",
          "transition-transform duration-300 ease-out",
          open ? "scale-90 opacity-0 pointer-events-none" : "hover:scale-105",
        )}
      >
        {/* aurora rings */}
        <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,oklch(0.42_0.09_168),oklch(0.75_0.18_140),oklch(0.55_0.18_210),oklch(0.42_0.09_168))] animate-spin [animation-duration:6s]" />
        <span className="absolute inset-[3px] rounded-full bg-card" />
        <span className="absolute -inset-1 rounded-full bg-primary/30 blur-xl animate-pulse" />
        <span className="relative z-10 flex h-full w-full items-center justify-center rounded-full text-primary">
          <Sparkles className="h-6 w-6" />
        </span>
        <span className="absolute -top-2 -right-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-md">
          AI
        </span>
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed z-50 transition-all duration-300 ease-out",
          "bottom-4 right-4 sm:bottom-5 sm:right-5",
          "w-[calc(100vw-2rem)] sm:w-[380px]",
          "h-[min(620px,calc(100vh-2rem))]",
          open
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none",
        )}
      >
        <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Animated gradient header */}
          <div className="relative overflow-hidden bg-[linear-gradient(135deg,oklch(0.42_0.09_168),oklch(0.55_0.15_200),oklch(0.42_0.09_168))] bg-[length:200%_200%] animate-[gradient_8s_ease_infinite] px-4 py-4 text-primary-foreground">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0">
                  <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                  <span className="relative flex h-full w-full items-center justify-center rounded-full bg-white/95 text-primary font-bold">
                    A
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">Aria</p>
                  <p className="text-[11px] opacity-90">HR co-pilot · online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1.5 hover:bg-white/20"
                  aria-label="Minimize"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => setMessages([WELCOME]), 300);
                  }}
                  className="rounded-md p-1.5 hover:bg-white/20"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap animate-[fadeIn_0.3s_ease-out]",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-secondary-foreground rounded-bl-sm border border-border",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {mutation.isPending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-secondary border border-border px-4 py-3">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && !mutation.isPending && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
            className="border-t border-border bg-card p-2.5 flex items-end gap-2"
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(draft);
                }
              }}
              rows={1}
              placeholder="Ask Aria anything…"
              className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring max-h-32"
            />
            <button
              type="submit"
              disabled={!draft.trim() || mutation.isPending}
              className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
