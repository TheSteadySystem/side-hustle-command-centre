"use client";

import { useState, useRef, useEffect } from "react";
import { Workspace, AIMessage } from "@/lib/types";
import { Send, Zap } from "lucide-react";

interface Props {
  workspace: Workspace;
  token: string;
  onOpenMessagePack: () => void;
  tabContext?: string;
  compact?: boolean;
}

const COACH_MODES = [
  {
    label: "I\u2019m stuck",
    prompt: "I\u2019m feeling stuck and don\u2019t know what to do next with my business. Based on where I am, what\u2019s the ONE most important thing I should focus on right now?",
    icon: "\uD83D\uDCA1",
  },
  {
    label: "Review my idea",
    prompt: "Can you honestly review my business idea? Tell me what\u2019s strong, what\u2019s risky, and what I should consider changing before I invest more time.",
    icon: "\uD83D\uDD0D",
  },
  {
    label: "What should I do this week?",
    prompt: "Based on where I am in my launch runway, give me a specific 3-task plan for this week that moves the needle the most.",
    icon: "\uD83D\uDDD3\uFE0F",
  },
  {
    label: "Help me get customers",
    prompt: "I need to find my first paying customers. Give me 3 specific things I can do THIS WEEK on my platforms to start getting sales.",
    icon: "\uD83D\uDC65",
  },
  {
    label: "Am I ready to launch?",
    prompt: "Look at my business setup \u2014 my offer, my pricing, my content. Am I ready to start selling? Be direct \u2014 \u201Cyes, go\u201D or \u201Cnot yet, here\u2019s what\u2019s missing.\u201D",
    icon: "\uD83D\uDE80",
  },
  {
    label: "Boost my confidence",
    prompt: "I\u2019m doubting myself and wondering if this business idea is worth pursuing. Help me see it objectively and give me real encouragement based on what I\u2019ve built so far.",
    icon: "\u26A1",
  },
];

export default function AICoach({
  workspace,
  token,
  onOpenMessagePack,
  tabContext,
  compact = false,
}: Props) {
  const storedConvo: AIMessage[] = workspace.ai_conversation ?? [];
  const [messages, setMessages] = useState<AIMessage[]>(storedConvo);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [remaining, setRemaining] = useState(workspace.ai_messages_remaining);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending || remaining <= 0) return;
    setInput("");
    setError(null);
    setSending(true);

    const userMsg: AIMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: token, message: text, tab_context: tabContext }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          setRemaining(0);
          onOpenMessagePack();
        } else {
          setError(data.error ?? "Something went wrong. Try again.");
        }
        setMessages((prev) => prev.filter((m) => m !== userMsg));
        return;
      }

      const assistantMsg: AIMessage = {
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setRemaining(data.messages_remaining);
    } catch {
      setError("Connection error. Try again.");
      setMessages((prev) => prev.filter((m) => m !== userMsg));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={compact ? "flex flex-col h-full animate-fade-in" : "flex flex-col h-[calc(100vh-140px)] min-h-[500px] animate-fade-in"}>
      {/* Header */}
      <div className="pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-text-primary text-xl font-bold">AI Coach</h2>
          <p className="text-text-muted text-sm mt-0.5">
            Knows your business inside out
          </p>
        </div>
        <button
          onClick={remaining <= 0 ? onOpenMessagePack : undefined}
          className="text-xs px-3 py-1.5 rounded-full font-medium"
          style={{
            backgroundColor:
              remaining <= 5 ? "rgba(239,68,68,0.15)" : "var(--brand-color-10)",
            color: remaining <= 5 ? "#f87171" : "var(--brand-color)",
            border: `1px solid ${remaining <= 5 ? "rgba(239,68,68,0.3)" : "var(--brand-color)"}`,
            cursor: remaining <= 0 ? "pointer" : "default",
          }}
        >
          {remaining} messages left
        </button>
      </div>

      {/* Coach modes — 2-column grid, only when no conversation */}
      {messages.length === 0 && (
        <div className="pb-4">
          <p className="text-text-subtle text-xs mb-3">What do you need help with?</p>
          <div className="grid grid-cols-2 gap-2">
            {COACH_MODES.map((mode) => (
              <button
                key={mode.label}
                onClick={() => sendMessage(mode.prompt)}
                className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-colors hover:bg-bg-cardHover"
                style={{ backgroundColor: "#141312", border: "1px solid #1F1E1C" }}
              >
                <span className="text-lg flex-shrink-0">{mode.icon}</span>
                <span className="text-text-secondary text-xs font-medium leading-snug">
                  {mode.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto space-y-3 rounded-xl p-4 mb-3"
        style={{ backgroundColor: "#141312", border: "1px solid #1F1E1C" }}
      >
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: "var(--brand-color-20)" }}
              >
                <Zap size={18} style={{ color: "var(--brand-color)" }} />
              </div>
              <p className="text-text-muted text-sm">
                Hey {workspace.buyer_name}! Ask me anything about{" "}
                {workspace.business_name}.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              style={
                msg.role === "user"
                  ? {
                      backgroundColor: "var(--brand-color)",
                      color: "var(--brand-text-on-brand)",
                      borderBottomRightRadius: "4px",
                    }
                  : {
                      backgroundColor: "#1A1918",
                      color: "#D4CFC6",
                      borderBottomLeftRadius: "4px",
                    }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl px-4 py-3 flex gap-1 items-center"
              style={{ backgroundColor: "#1A1918", borderBottomLeftRadius: "4px" }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "#6B6560",
                    animationDelay: `${i * 150}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-center" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Outgrowing CTA — subtle */}
      <div
        className="mb-3 px-4 py-3 rounded-xl flex items-center justify-between"
        style={{ backgroundColor: "#141312", border: "1px solid #1F1E1C" }}
      >
        <p className="text-text-subtle text-xs">
          Need deeper strategy support?
        </p>
        <a
          href="https://thesteadysystem.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium transition-opacity hover:opacity-80"
          style={{ color: "var(--brand-color)" }}
        >
          Book a Strategy Session →
        </a>
      </div>

      {/* Input */}
      {remaining <= 0 ? (
        <button
          onClick={onOpenMessagePack}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--brand-color)", color: "var(--brand-text-on-brand)" }}
        >
          Get 50 more messages — $5
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${workspace.business_name}...`}
            disabled={sending}
            className="flex-1 px-4 py-3 rounded-xl text-sm text-text-primary placeholder:text-text-ghost disabled:opacity-50"
            style={{ backgroundColor: "#141312", border: "1px solid #2A2825" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="px-4 py-3 rounded-xl disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: "var(--brand-color)" }}
          >
            <Send size={16} style={{ color: "var(--brand-text-on-brand)" }} />
          </button>
        </form>
      )}
    </div>
  );
}
