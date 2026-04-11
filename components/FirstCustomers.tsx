"use client";

import { Workspace, FirstCustomerStep } from "@/lib/types";
import { Check } from "lucide-react";

interface Props {
  workspace: Workspace;
  updateWorkspace: (field: string, value: unknown) => Promise<void>;
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

export default function FirstCustomers({ workspace, updateWorkspace }: Props) {
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
        <h2 className="text-text-primary text-xl font-bold">Your First 10 Customers</h2>
        <div
          className="rounded-xl p-8 text-center"
          style={{ backgroundColor: "#141312", border: "1px solid #1F1E1C" }}
        >
          <p className="text-text-muted">
            Your customer acquisition plan is being generated...
          </p>
          <p className="text-text-subtle text-sm mt-2">
            It will appear here once your workspace content is ready.
          </p>
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
        style={{ backgroundColor: "#141312", border: "1px solid #1F1E1C" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-secondary text-sm font-medium">Progress</span>
          <span className="font-bold" style={{ color: "var(--brand-color)" }}>
            {doneCount}/{steps.length}
          </span>
        </div>
        <div className="h-2 rounded-full" style={{ backgroundColor: "#2A2825" }}>
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
            All steps complete — time to celebrate your first customers!
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
                backgroundColor: "#141312",
                border: isDone ? "1px solid var(--brand-color)" : "1px solid #1F1E1C",
                opacity: isDone ? 0.7 : 1,
              }}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div
                  className="mt-0.5 w-6 h-6 rounded flex items-center justify-center flex-shrink-0 border transition-all"
                  style={{
                    backgroundColor: isDone ? "var(--brand-color)" : "transparent",
                    borderColor: isDone ? "var(--brand-color)" : "#2A2825",
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
                      color: isDone ? "#4A4540" : "#F5F0E8",
                      textDecoration: isDone ? "line-through" : "none",
                    }}
                  >
                    {step.action}
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: isDone ? "#3A3835" : "#8A8478" }}
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
