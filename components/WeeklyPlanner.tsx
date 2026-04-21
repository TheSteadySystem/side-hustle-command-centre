"use client";

import { WeeklyPlan, TimeBlock } from "@/lib/types";

interface Props {
  weeklyPlan: WeeklyPlan;
}

const CATEGORY_STYLES: Record<string, { color: string; label: string }> = {
  build: { color: "#3B82F6", label: "Build" },
  content: { color: "#A855F7", label: "Content" },
  outreach: { color: "#10B981", label: "Outreach" },
  admin: { color: "#6B7280", label: "Admin" },
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function WeeklyPlanner({ weeklyPlan }: Props) {
  const blocks = weeklyPlan.blocks ?? [];
  const totalMinutes = blocks.reduce((sum, b) => sum + b.minutes, 0);
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

  // Group blocks by day
  const byDay: Record<string, TimeBlock[]> = {};
  for (const block of blocks) {
    if (!byDay[block.day]) byDay[block.day] = [];
    byDay[block.day].push(block);
  }

  // Get days that have blocks, in order
  const activeDays = DAYS.filter((d) => byDay[d]?.length);

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ backgroundColor: "#F4F0E7", border: "1px solid #D8D4C8" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-text-subtle text-xs uppercase tracking-widest">
          Your Weekly Game Plan
        </p>
        <span className="text-xs font-medium" style={{ color: "var(--brand-color)" }}>
          {weeklyPlan.suggested_hours}h/week
        </span>
      </div>

      {/* Days */}
      <div className="space-y-3">
        {activeDays.map((day) => (
          <div key={day}>
            <p className="text-text-muted text-xs font-semibold mb-1.5">{day}</p>
            <div className="space-y-1.5">
              {byDay[day].map((block, i) => {
                const cat = CATEGORY_STYLES[block.category] ?? CATEGORY_STYLES.admin;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-lg"
                    style={{ backgroundColor: "#EDE8DC" }}
                  >
                    <div
                      className="w-1 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-text-secondary text-xs truncate">{block.task}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        {cat.label}
                      </span>
                      <span className="text-text-subtle text-xs font-medium w-10 text-right">
                        {block.minutes}m
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend + total */}
      <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid #D8D4C8" }}>
        <div className="flex gap-3">
          {Object.entries(CATEGORY_STYLES).map(([key, { color, label }]) => (
            <div key={key} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-text-ghost text-xs">{label}</span>
            </div>
          ))}
        </div>
        <span className="text-text-subtle text-xs">{totalHours}h total</span>
      </div>
    </div>
  );
}
