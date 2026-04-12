"use client";

import { useState, useEffect } from "react";
import { Workspace } from "@/lib/types";
import AICoach from "./AICoach";
import { MessageCircle, X, Sparkles } from "lucide-react";

interface Props {
  workspace: Workspace;
  token: string;
  onOpenMessagePack: () => void;
  tabContext: string;
  hidden?: boolean;
}

const TAB_HINTS: Record<string, string> = {
  dashboard: "Need help knowing what to focus on?",
  runway: "Stuck on a step? Ask for help with this phase.",
  customers: "Need scripts to reach out? I can help.",
  money: "Want pricing or revenue advice?",
  content: "Need ideas to customize these prompts?",
  offer: "Want help writing your tagline or pitch?",
};

export default function FloatingCoach({
  workspace,
  token,
  onOpenMessagePack,
  tabContext,
  hidden = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set());

  // Show a one-time hint tooltip for each tab (helps first-time users)
  useEffect(() => {
    if (hidden || open) return;
    const key = `shcc_coach_hint_${tabContext}`;
    if (typeof window !== "undefined" && !localStorage.getItem(key)) {
      const timer = setTimeout(() => setShowHint(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [tabContext, hidden, open]);

  const dismissHint = () => {
    setShowHint(false);
    const key = `shcc_coach_hint_${tabContext}`;
    if (typeof window !== "undefined") {
      localStorage.setItem(key, "1");
    }
    setDismissedHints((prev) => new Set(prev).add(tabContext));
  };

  const handleOpen = () => {
    setOpen(true);
    dismissHint();
  };

  if (hidden) return null;

  return (
    <>
      {/* Hint tooltip */}
      {showHint && !open && TAB_HINTS[tabContext] && !dismissedHints.has(tabContext) && (
        <div
          className="fixed bottom-24 right-5 sm:right-8 z-40 max-w-[260px] animate-fade-in"
          style={{
            backgroundColor: "#1A1918",
            border: "1px solid var(--brand-color)",
            borderRadius: "12px",
            padding: "12px 14px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          <div className="flex items-start gap-2">
            <Sparkles size={14} style={{ color: "var(--brand-color)", marginTop: 2 }} />
            <div className="flex-1">
              <p className="text-xs text-text-primary leading-relaxed">
                {TAB_HINTS[tabContext]}
              </p>
              <button
                onClick={handleOpen}
                className="text-xs font-semibold mt-1.5"
                style={{ color: "var(--brand-color)" }}
              >
                Ask the coach →
              </button>
            </div>
            <button
              onClick={dismissHint}
              className="text-text-ghost hover:text-text-muted"
              aria-label="Dismiss hint"
            >
              <X size={14} />
            </button>
          </div>
          <div
            className="absolute -bottom-1 right-6 w-2 h-2 rotate-45"
            style={{
              backgroundColor: "#1A1918",
              borderRight: "1px solid var(--brand-color)",
              borderBottom: "1px solid var(--brand-color)",
            }}
          />
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-5 right-5 sm:right-8 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{
          backgroundColor: "var(--brand-color)",
          color: "var(--brand-text-on-brand)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
        aria-label="Open AI Coach"
      >
        <MessageCircle size={18} />
        <span className="text-sm font-semibold hidden sm:inline">Ask Coach</span>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        >
          {workspace.ai_messages_remaining}
        </span>
      </button>

      {/* Drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end animate-fade-in"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full sm:max-w-md sm:mr-4 sm:mb-4 sm:rounded-2xl overflow-hidden flex flex-col"
            style={{
              backgroundColor: "#0C0B0A",
              border: "1px solid #1F1E1C",
              height: "85vh",
              maxHeight: "700px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "#1F1E1C" }}
            >
              <div>
                <p className="text-text-primary font-semibold text-sm">AI Coach</p>
                <p className="text-text-subtle text-xs">
                  Viewing: {tabContext}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-bg-cardHover transition-colors"
                aria-label="Close"
              >
                <X size={18} className="text-text-muted" />
              </button>
            </div>

            {/* Coach content */}
            <div className="flex-1 px-4 pb-4 overflow-hidden">
              <AICoach
                workspace={workspace}
                token={token}
                onOpenMessagePack={onOpenMessagePack}
                tabContext={tabContext}
                compact
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
