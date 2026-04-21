"use client";

import { getMilestoneLabel } from "@/lib/utils";

const ALL_MILESTONES = [
  "system_activated",
  "first_task",
  "runway_halfway",
  "runway_complete",
  "first_content",
  "content_week",
  "first_sale",
  "goal_hit",
];

const MILESTONE_ICONS: Record<string, string> = {
  system_activated: "⚡",
  first_task: "✅",
  runway_halfway: "🏃",
  runway_complete: "🛫",
  first_content: "📱",
  content_week: "🔥",
  first_sale: "💰",
  goal_hit: "🎯",
};

interface Props {
  milestones: string[];
}

export default function MilestoneBar({ milestones }: Props) {
  const earned = new Set(milestones);

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_MILESTONES.map((m) => {
        const isEarned = earned.has(m);
        return (
          <div
            key={m}
            title={getMilestoneLabel(m)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={
              isEarned
                ? {
                    backgroundColor: "var(--brand-color-20)",
                    color: "var(--brand-color)",
                    border: "1px solid var(--brand-color)",
                  }
                : {
                    backgroundColor: "#F4F0E7",
                    color: "#B0AFB8",
                    border: "1px solid #D8D4C8",
                    opacity: 0.6,
                  }
            }
          >
            <span>{MILESTONE_ICONS[m]}</span>
            <span className="hidden sm:inline">{getMilestoneLabel(m)}</span>
          </div>
        );
      })}
    </div>
  );
}
