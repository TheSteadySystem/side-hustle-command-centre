"use client";

import { Workspace } from "@/lib/types";
import { ContentPrompt } from "@/lib/types";
import { getContentStreak } from "@/lib/utils";
import { Check, Flame, Sparkles, AlertCircle } from "lucide-react";

interface Props {
  workspace: Workspace;
  updateWorkspace: (field: string, value: unknown) => Promise<void>;
  onGenerate?: () => Promise<void>;
  isGenerating?: boolean;
  generationError?: string | null;
}

const TYPE_COLORS: Record<string, string> = {
  Reel: "#6366F1",
  Story: "#EC4899",
  Carousel: "#F59E0B",
  Photo: "#10B981",
  Video: "#0EA5E9",
  Post: "#8B5CF6",
};

export default function ContentEngine({ workspace, updateWorkspace, onGenerate, isGenerating, generationError }: Props) {
  const contentState = workspace.content_state ?? {};
  const prompts: ContentPrompt[] =
    (contentState.prompts as ContentPrompt[]) ?? [];
  const streak = getContentStreak(contentState);
  const platforms: string[] = workspace.platforms ?? [];

  const toggleDay = async (day: number) => {
    const key = String(day);
    const newState = {
      ...contentState,
      [key]: !contentState[key],
    };
    await updateWorkspace("content_state", newState);

    // Check milestones
    const milestones = [...(workspace.milestones ?? [])];
    const newStreak = getContentStreak(newState);
    if (!milestones.includes("first_content") && newState["1"]) {
      milestones.push("first_content");
      await updateWorkspace("milestones", milestones);
    }
    if (!milestones.includes("content_week") && newStreak >= 7) {
      milestones.push("content_week");
      await updateWorkspace("milestones", milestones);
    }
  };

  const doneCount = prompts.filter((p) => !!contentState[String(p.day)]).length;

  if (prompts.length === 0) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div>
          <h2 className="text-text-primary text-xl font-bold">Content Engine</h2>
          <p className="text-text-muted text-sm mt-1">
            30 days of content tailored to{" "}
            {platforms.length > 0 ? platforms.join(", ") : "your platforms"}
          </p>
        </div>
        <div
          className="rounded-xl p-8 text-center space-y-4"
          style={{ backgroundColor: "#F4F0E7", border: "1px solid #D8D4C8" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: "var(--brand-color-20)" }}
          >
            <Sparkles size={20} style={{ color: "var(--brand-color)" }} />
          </div>
          <div>
            <p className="text-text-primary font-semibold">
              Generate your 30-day content calendar
            </p>
            <p className="text-text-muted text-sm mt-2 max-w-md mx-auto leading-relaxed">
              Your AI coach will create 30 content prompts for {workspace.business_name},
              specific to your audience, distributed across your platforms.
            </p>
          </div>

          {generationError && (
            <div
              className="flex items-start gap-2 px-4 py-3 rounded-lg text-left max-w-md mx-auto"
              style={{
                backgroundColor: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              <AlertCircle size={14} style={{ color: "#f87171", marginTop: 2 }} />
              <p className="text-xs" style={{ color: "#f87171" }}>
                {generationError}
              </p>
            </div>
          )}

          {onGenerate && (
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--brand-color)",
                color: "var(--brand-text-on-brand)",
              }}
            >
              {isGenerating ? "Generating..." : "Generate My Content Calendar"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-text-primary text-xl font-bold">Content Engine</h2>
        <p className="text-text-muted text-sm mt-1">
          30 days of content tailored to{" "}
          {platforms.length > 0 ? platforms.join(", ") : "your platforms"}
        </p>
      </div>

      {/* Stats row */}
      <div className="flex gap-3">
        <div
          className="flex-1 rounded-xl p-4 text-center"
          style={{ backgroundColor: "#F4F0E7", border: "1px solid #D8D4C8" }}
        >
          <p className="text-2xl font-bold text-text-primary">{doneCount}/30</p>
          <p className="text-text-subtle text-xs mt-1">Posts Done</p>
        </div>
        <div
          className="flex-1 rounded-xl p-4 text-center"
          style={{
            backgroundColor: "#F4F0E7",
            border: streak > 0 ? "1px solid var(--brand-color)" : "1px solid #D8D4C8",
          }}
        >
          <div className="flex items-center justify-center gap-1">
            <p
              className="text-2xl font-bold"
              style={{ color: streak > 0 ? "var(--brand-color)" : "#1E1E24" }}
            >
              {streak}
            </p>
            {streak > 0 && (
              <Flame size={18} style={{ color: "var(--brand-color)" }} />
            )}
          </div>
          <p className="text-text-subtle text-xs mt-1">Day Streak</p>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {prompts.map((prompt) => {
          const isDone = !!contentState[String(prompt.day)];
          const typeColor = TYPE_COLORS[prompt.type] ?? "#6B6A75";

          return (
            <button
              key={prompt.day}
              onClick={() => toggleDay(prompt.day)}
              className="rounded-xl p-4 text-left transition-all hover:bg-bg-cardHover"
              style={{
                backgroundColor: "#F4F0E7",
                border: isDone
                  ? "1px solid var(--brand-color)"
                  : "1px solid #D8D4C8",
                opacity: isDone ? 0.7 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--brand-color-10)",
                        color: "var(--brand-color)",
                      }}
                    >
                      Day {prompt.day}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${typeColor}20`,
                        color: typeColor,
                      }}
                    >
                      {prompt.type}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: isDone ? "#B0AFB8" : "#3A3A44",
                      textDecoration: isDone ? "line-through" : "none",
                    }}
                  >
                    {prompt.prompt}
                  </p>
                  <p className="text-text-subtle text-xs">{prompt.platform}</p>
                </div>

                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                  style={{
                    backgroundColor: isDone ? "var(--brand-color)" : "transparent",
                    border: isDone
                      ? "none"
                      : "1px solid #C4C1BB",
                  }}
                >
                  {isDone && <Check size={12} color="#E8E4DC" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
