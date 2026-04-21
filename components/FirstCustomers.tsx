"use client";

import { Workspace, FirstCustomerStep } from "@/lib/types";
import { Check, Sparkles, AlertCircle } from "lucide-react";

interface Props {
  workspace: Workspace;
  updateWorkspace: (field: string, value: unknown) => Promise<void>;
  onGenerate?: () => Promise<void>;
  isGenerating?: boolean;
  generationError?: string | null;
}

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "#E4405F",
  TikTok: "#010101",
  Etsy: "#F5640A",
  Shopify: "#96BF48",
  Facebook: "#1877F2",
  Pinterest: "#E60023",
  "Local/In-Person": "#10B981",
};

export default function FirstCustomers({ workspace, updateWorkspace, onGenerate, isGenerating, generationError }: Props) {
  const steps: FirstCustomerStep[] =
    (workspace.runway_state?.first_customers as FirstCustomerStep[]) ?? [];
  const state = workspace.runway_state ?? {};

  const doneCount = steps.filter((_, i) => !!state[`fc_${i}`]).length;

  const toggleStep = async (index: number) => {
    const key = `fc_${index}`;
    const newState = { ...state, [key]: !state[key] };
    await updateWorkspace("runway_state", newState);

    // Check milestone
    const milestones = [...(workspace.milestones ?? [])];
    const newDone = steps.filter((_, i) => !!newState[`fc_${i}`]).length;
    if (newDone === steps.length && steps.length > 0 && !milestones.includes("first_customers_complete")) {
      milestones.push("first_customers_complete");
      await updateWorkspace("milestones", milestones);
    }
  };

  if (steps.length === 0) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div>
          <h2 className="text-text-primary text-xl font-bold">Your First 10 Customers</h2>
          <p className="text-text-muted text-sm mt-1">
            Specific steps to get your first paying customers, fast
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
              Generate your first 10 customers plan
            </p>
            <p className="text-text-muted text-sm mt-2 max-w-md mx-auto leading-relaxed">
              Your AI coach will create 10 specific outreach steps for {workspace.business_name}:
              exact scripts, platform-specific tactics, ordered from easiest to advanced.
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
              {isGenerating ? "Generating..." : "Generate My Plan"}
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
        <h2 className="text-text-primary text-xl font-bold">Your First 10 Customers</h2>
        <p className="text-text-muted text-sm mt-1">
          Specific steps to get your first paying customers, fast
        </p>
      </div>

      {/* Progress */}
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: "#F4F0E7", border: "1px solid #D8D4C8" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-secondary text-sm font-medium">Progress</span>
          <span className="font-bold" style={{ color: "var(--brand-color)" }}>
            {doneCount}/{steps.length}
          </span>
        </div>
        <div className="h-2 rounded-full" style={{ backgroundColor: "#C4C1BB" }}>
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${steps.length > 0 ? (doneCount / steps.length) * 100 : 0}%`,
              backgroundColor: "var(--brand-color)",
            }}
          />
        </div>
        {doneCount === steps.length && steps.length > 0 && (
          <p className="text-center text-sm mt-3" style={{ color: "var(--brand-color)" }}>
            All steps complete. Time to celebrate your first customers!
          </p>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const isDone = !!state[`fc_${i}`];
          const platformColor = PLATFORM_COLORS[step.platform] ?? "var(--brand-color)";

          return (
            <button
              key={i}
              onClick={() => toggleStep(i)}
              className="w-full rounded-xl p-4 text-left transition-all hover:bg-bg-cardHover"
              style={{
                backgroundColor: "#F4F0E7",
                border: isDone ? "1px solid var(--brand-color)" : "1px solid #D8D4C8",
                opacity: isDone ? 0.7 : 1,
              }}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div
                  className="mt-0.5 w-6 h-6 rounded flex items-center justify-center flex-shrink-0 border transition-all"
                  style={{
                    backgroundColor: isDone ? "var(--brand-color)" : "transparent",
                    borderColor: isDone ? "var(--brand-color)" : "#C4C1BB",
                  }}
                >
                  {isDone && <Check size={12} style={{ color: "var(--brand-text-on-brand)" }} />}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--brand-color-10)",
                        color: "var(--brand-color)",
                      }}
                    >
                      Step {step.step}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${platformColor}20`,
                        color: platformColor,
                      }}
                    >
                      {step.platform}
                    </span>
                  </div>
                  <p
                    className="text-sm font-semibold leading-relaxed"
                    style={{
                      color: isDone ? "#B0AFB8" : "#1E1E24",
                      textDecoration: isDone ? "line-through" : "none",
                    }}
                  >
                    {step.action}
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: isDone ? "#AFADA8" : "#6B6A75" }}
                  >
                    {step.detail}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
