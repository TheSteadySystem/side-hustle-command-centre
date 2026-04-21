"use client";

import { useState } from "react";
import { Workspace, RunwayPhase } from "@/lib/types";
import { getRunwayProgress } from "@/lib/utils";
import { ChevronDown, Check, Sparkles, AlertCircle } from "lucide-react";

interface Props {
  workspace: Workspace;
  updateWorkspace: (field: string, value: unknown) => Promise<void>;
  onGenerate?: () => Promise<void>;
  isGenerating?: boolean;
  generationError?: string | null;
}

export default function LaunchRunway({ workspace, updateWorkspace, onGenerate, isGenerating, generationError }: Props) {
  const phases: RunwayPhase[] =
    (workspace.runway_state?.phases as RunwayPhase[]) ?? [];
  const state = workspace.runway_state ?? {};
  const progress = getRunwayProgress(phases, state);
  const [openPhases, setOpenPhases] = useState<Set<number>>(new Set([0]));

  const togglePhase = (pi: number) => {
    setOpenPhases((prev) => {
      const next = new Set(prev);
      if (next.has(pi)) { next.delete(pi); } else { next.add(pi); }
      return next;
    });
  };

  const toggleItem = async (pi: number, ii: number) => {
    const key = `${pi}_${ii}`;
    const newState = { ...state, [key]: !state[key] };

    // Check milestone: runway halfway
    const newProgress = getRunwayProgress(phases, newState);
    const milestones: string[] = [...(workspace.milestones ?? [])];

    if (newProgress >= 50 && !milestones.includes("runway_halfway")) {
      milestones.push("runway_halfway");
      await updateWorkspace("milestones", milestones);
    }
    if (newProgress === 100 && !milestones.includes("runway_complete")) {
      milestones.push("runway_complete");
      await updateWorkspace("milestones", milestones);
    }
    if (!milestones.includes("first_task")) {
      milestones.push("first_task");
      await updateWorkspace("milestones", milestones);
    }

    await updateWorkspace("runway_state", newState);
  };

  const getPhaseProgress = (pi: number, items: string[]) => {
    const done = items.filter((_, ii) => state[`${pi}_${ii}`]).length;
    return { done, total: items.length };
  };

  if (phases.length === 0) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div>
          <h2 className="text-text-primary text-xl font-bold">Launch Runway</h2>
          <p className="text-text-muted text-sm mt-1">
            Your personalized path from idea to launch
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
              Generate your personalized launch runway
            </p>
            <p className="text-text-muted text-sm mt-2 max-w-md mx-auto leading-relaxed">
              Your AI coach will create a 4-phase launch plan tailored to {workspace.business_name}:
              specific tasks, not generic advice. Takes about 30 seconds.
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
              {isGenerating ? "Generating..." : "Generate My Runway"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-text-primary text-xl font-bold">Launch Runway</h2>
        <p className="text-text-muted text-sm mt-1">
          Your personalized path from idea to launch
        </p>
      </div>

      {/* Overall progress */}
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: "#F4F0E7", border: "1px solid #D8D4C8" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-secondary text-sm font-medium">Overall Progress</span>
          <span className="font-bold" style={{ color: "var(--brand-color)" }}>
            {progress}%
          </span>
        </div>
        <div className="h-2 rounded-full" style={{ backgroundColor: "#C4C1BB" }}>
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: "var(--brand-color)" }}
          />
        </div>
        {progress === 100 && (
          <p className="text-center text-sm mt-3" style={{ color: "var(--brand-color)" }}>
            Runway complete. You&apos;re ready to launch!
          </p>
        )}
      </div>

      {/* Phases */}
      <div className="space-y-3">
        {phases.map((phase, pi) => {
          const { done, total } = getPhaseProgress(pi, phase.items);
          const isOpen = openPhases.has(pi);
          const phaseComplete = done === total && total > 0;

          return (
            <div
              key={pi}
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: "#F4F0E7",
                border: phaseComplete
                  ? "1px solid var(--brand-color)"
                  : "1px solid #D8D4C8",
              }}
            >
              {/* Phase header */}
              <button
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-bg-cardHover transition-colors"
                onClick={() => togglePhase(pi)}
              >
                <div className="flex items-center gap-3 text-left">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      backgroundColor: phaseComplete
                        ? "var(--brand-color)"
                        : "var(--brand-color-20)",
                      color: phaseComplete ? "#E8E4DC" : "var(--brand-color)",
                    }}
                  >
                    {phaseComplete ? <Check size={12} /> : pi + 1}
                  </div>
                  <div>
                    <p className="text-text-primary font-semibold text-sm">
                      {phase.name}
                    </p>
                    <p className="text-text-subtle text-xs">
                      {done}/{total} tasks
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-text-subtle transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Phase items */}
              {isOpen && (
                <div className="px-5 pb-4 space-y-2">
                  <div
                    className="h-px mb-3"
                    style={{ backgroundColor: "#D8D4C8" }}
                  />
                  {phase.items.map((item, ii) => {
                    const done = !!state[`${pi}_${ii}`];
                    return (
                      <button
                        key={ii}
                        onClick={() => toggleItem(pi, ii)}
                        className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-bg-cardHover transition-colors text-left"
                      >
                        <div
                          className="mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-all"
                          style={{
                            backgroundColor: done ? "var(--brand-color)" : "transparent",
                            borderColor: done ? "var(--brand-color)" : "#C4C1BB",
                          }}
                        >
                          {done && <Check size={11} color="#E8E4DC" />}
                        </div>
                        <span
                          className="text-sm leading-relaxed transition-all"
                          style={{
                            color: done ? "#B0AFB8" : "#3A3A44",
                            textDecoration: done ? "line-through" : "none",
                          }}
                        >
                          {item}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
