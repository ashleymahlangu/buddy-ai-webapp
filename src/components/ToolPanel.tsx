import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { runAiTool } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Copy, Loader2, Sparkles } from "lucide-react";

type ToolKey = "email" | "meeting" | "chat" | "tasks" | "research";

export function ToolPanel({
  tool,
  title,
  subtitle,
  placeholder,
  examples,
}: {
  tool: ToolKey;
  title: string;
  subtitle: string;
  placeholder: string;
  examples?: string[];
}) {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const fn = useServerFn(runAiTool);

  const mutation = useMutation({
    mutationFn: (p: string) => fn({ data: { tool, prompt: p } }),
    onSuccess: (res) => setOutput(res.content),
    onError: (err: Error) => setOutput(`⚠️ ${err.message}`),
  });

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
            <Sparkles className="h-3 w-3" /> AI HR Assistant
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>
        </div>

        <Card className="p-6">
          <label className="text-sm font-medium text-foreground">Your input</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            className="mt-2 min-h-40 resize-y"
          />

          {examples && examples.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setPrompt(ex)}
                  className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground hover:bg-accent"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Review AI output before acting. Don't share confidential employee data.
            </p>
            <Button
              onClick={() => mutation.mutate(prompt)}
              disabled={!prompt.trim() || mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate
                </>
              )}
            </Button>
          </div>
        </Card>

        {output && (
          <Card className="mt-6 p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Result
              </h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(output)}
              >
                <Copy className="mr-2 h-4 w-4" /> Copy
              </Button>
            </div>
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground">
              {output}
            </pre>
          </Card>
        )}
      </main>
    </div>
  );
}
