import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { chatWithAria } from "@/lib/chat.functions";
import { Mic, MicOff, X, Volume2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

// Minimal typing for the Web Speech API (vendor-prefixed in some browsers)
type SR = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  lang: string;
  interimResults: boolean;
  continuous: boolean;
};

function getRecognition(): SR | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec: SR = new Ctor();
  rec.lang = "en-US";
  rec.interimResults = true;
  rec.continuous = false;
  return rec;
}

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/[*_`#>]/g, "");
  const utter = new SpeechSynthesisUtterance(clean);
  utter.rate = 1.02;
  utter.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => /female|samantha|zira|google us english/i.test(v.name)) ||
    voices.find((v) => v.lang?.startsWith("en"));
  if (preferred) utter.voice = preferred;
  window.speechSynthesis.speak(utter);
}

export function VoiceHrAssistant() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [transcript, setTranscript] = useState("");
  const [history, setHistory] = useState<Msg[]>([]);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SR | null>(null);
  const fn = useServerFn(chatWithAria);

  const mutation = useMutation({
    mutationFn: (msgs: Msg[]) => fn({ data: { messages: msgs } }),
    onSuccess: (res) => {
      const reply = res.content || "Sorry, I didn't catch that.";
      setHistory((h) => [...h, { role: "assistant", content: reply }]);
      speak(reply);
    },
    onError: (e: Error) => {
      setHistory((h) => [...h, { role: "assistant", content: `⚠️ ${e.message}` }]);
    },
  });

  useEffect(() => {
    const r = getRecognition();
    if (!r) {
      setSupported(false);
      return;
    }
    recRef.current = r;
    r.onresult = (e: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interimText += t;
      }
      if (interimText) setInterim(interimText);
      if (finalText) {
        setInterim("");
        setTranscript((prev) => (prev + " " + finalText).trim());
      }
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    // Prime voices
    window.speechSynthesis?.getVoices();
  }, []);

  const startListening = async () => {
    if (!recRef.current) return;
    try {
      await navigator.mediaDevices?.getUserMedia({ audio: true }).catch(() => {});
      setTranscript("");
      setInterim("");
      recRef.current.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const stopListening = () => {
    recRef.current?.stop();
    setListening(false);
  };

  const send = () => {
    const text = (transcript + " " + interim).trim();
    if (!text) return;
    const next = [...history, { role: "user" as const, content: text }];
    setHistory(next);
    setTranscript("");
    setInterim("");
    mutation.mutate(next);
  };

  return (
    <>
      {/* Launcher orb — bottom LEFT to avoid Aria on the right */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open Voice HR Assistant"
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-xl ring-4 ring-foreground/10 transition hover:scale-105"
      >
        <Mic className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
          V
        </span>
      </button>

      {open && (
        <div className="fixed bottom-24 left-6 z-50 w-[340px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border bg-foreground px-4 py-3 text-background">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <span className="text-sm font-semibold">Voice HR Assistant</span>
            </div>
            <button
              onClick={() => {
                stopListening();
                window.speechSynthesis?.cancel();
                setOpen(false);
              }}
              className="rounded-full p-1 hover:bg-background/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-4 py-4">
            {!supported ? (
              <p className="text-sm text-muted-foreground">
                Voice input isn't supported in this browser. Try Chrome or Edge.
              </p>
            ) : (
              <>
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={listening ? stopListening : startListening}
                    className={cn(
                      "relative flex h-20 w-20 items-center justify-center rounded-full transition",
                      listening
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-primary text-primary-foreground hover:scale-105",
                    )}
                  >
                    {listening && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-destructive/40" />
                    )}
                    {listening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    {listening ? "Listening… tap to stop" : "Tap to speak"}
                  </p>
                </div>

                <div className="mt-3 min-h-16 rounded-lg bg-secondary/60 p-3 text-sm">
                  {transcript || interim ? (
                    <>
                      <span>{transcript} </span>
                      <span className="text-muted-foreground italic">{interim}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      Try: "How do I give difficult feedback to a senior engineer?"
                    </span>
                  )}
                </div>

                <button
                  onClick={send}
                  disabled={(!transcript && !interim) || mutation.isPending}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Thinking
                    </>
                  ) : (
                    "Ask Aria by voice"
                  )}
                </button>

                {history.length > 0 && (
                  <div className="mt-4 max-h-44 space-y-2 overflow-y-auto border-t border-border pt-3 text-sm">
                    {history.slice(-4).map((m, i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-lg px-3 py-2",
                          m.role === "user"
                            ? "bg-primary/10 text-foreground"
                            : "bg-secondary text-foreground",
                        )}
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {m.role === "user" ? "You" : "Aria"}
                        </div>
                        <div className="mt-0.5 whitespace-pre-wrap">{m.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
