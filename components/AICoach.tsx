"use client";

import { useState, useRef, useEffect } from "react";
import { Workspace, AIMessage } from "@/lib/types";
import { Send, Zap } from "lucide-react";

interface Props {
  workspace: Workspace;
  token: string;
  onOpenMessagePack: () => void;
}

const SUGGESTED_PROMPTS = [
  "What should I focus on this week?",
  "How do I price my products?",
  "Write me an Instagram caption for my launch",
  "What's my next most important task?",
];

export default function AICoach({
  workspace,
  token,
  onOpenMessagePack,
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
        body: JSON.stringify({ access_token: token, message: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          setRemaining(0);
          onOpenMessagePack();
        } else {
          setError(data.error ?? "Something went wrong. Try again.");
        }
        // Remove optimistic user message on error
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
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[500px] animate-fade-in">
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

      {/* Suggested prompts — only when no conversation */}
      {messages.length === 0 && (
        <div className="pb-4">
          <p className="text-text-subtle text-xs mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="text-xs px-3 py-2 rounded-lg transition-colors hover:opacity-90"
                style={{
                  backgroundColor: "var(--brand-color-10)",
                  color: "var(--brand-color)",
                  border: "1px solid var(--brand-color)",
                }}
              >
                {p}
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
                      color: "#0C0B0A",
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
          style={{ backgroundColor: "var(--brand-color)", color: "#0C0B0A" }}
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
            <Send size={16} color="#0C0B0A" />
          </button>
        </form>
      )}
    </div>
  );
}
