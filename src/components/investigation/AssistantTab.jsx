import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { askAssistant } from "@/lib/assistant-api";
import { Panel } from "@/components/common/Panels";
import { Textarea } from "@/components/ui/textarea";

const SUGGESTIONS = [
  "What does the evidence establish so far?",
  "Where is this evidence base weakest?",
  "Which claims should I verify first?",
];

export default function AssistantTab({ bundle }) {
  const ask = useServerFn(askAssistant);
  const [messages, setMessages] = useState(bundle.messages || []);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, busy]);

  const send = async (question) => {
    const text = question.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((prev) => [...prev, { id: `pending-${Date.now()}`, role: "user", content: text }]);
    setBusy(true);
    try {
      const result = await ask({ data: { investigationId: bundle.investigation.id, question: text } });
      setMessages((prev) => [...prev, result.message]);
    } catch (error) {
      toast.error(error?.message || "The assistant could not answer right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel className="flex h-[calc(100vh-320px)] min-h-[420px] flex-col p-0">
      <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3.5">
        <Sparkles className="h-4 w-4 text-primary" />
        <div>
          <p className="text-xs font-medium text-foreground">Dossier assistant</p>
          <p className="text-[10px] text-muted-foreground">
            Answers only from this investigation's sources
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.length === 0 && (
          <div className="space-y-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Ask about anything inside this dossier. If the sources cannot answer, the assistant
              will say so rather than guess.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[86%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                message.role === "user"
                  ? "bg-primary/15 text-foreground"
                  : "border border-white/8 bg-white/[0.025] text-foreground/90"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Reading the dossier…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="border-t border-white/5 p-3"
      >
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about this evidence base…"
            className="min-h-[44px] resize-none border-white/10 bg-white/[0.03] py-3 text-xs"
            rows={1}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
            aria-label="Send question"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </Panel>
  );
}