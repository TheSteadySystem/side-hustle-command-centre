"use client";

import { Workspace, RunwayPhase, ContentPrompt, WeeklyPlan } from "@/lib/types";
import MilestoneBar from "./MilestoneBar";
import WeeklyPlanner from "./WeeklyPlanner";
import {
  formatCurrency,
  getRunwayProgress,
  getTotalRevenue,
  getDaysUntilLaunch,
  getContentStreak,
} from "@/lib/utils";
import { Rocket, TrendingUp, Target, Flame, ArrowRight } from "lucide-react";

type Tab = "dashboard" | "runway" | "customers" | "money" | "content" | "offer" | "coach";

interface Props {
  workspace: Workspace;
  onTabChange: (tab: Tab) => void;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  onClick,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  onClick?: () => void;
}) {
  return (
    <div
      className="rounded-xl p-5 space-y-3 cursor-pointer transition-colors"
      style={{ backgroundColor: "#141312", border: "1px solid #1F1E1C" }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-xs uppercase tracking-widest">{label}</span>
        <Icon size={16} style={{ color: "var(--brand-color)" }} />
      </div>
      <div>
        <p className="text-text-primary text-2xl font-bold">{value}</p>
        {sub && <p className="text-text-subtle text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard({ workspace, onTabChange }: Props) {
  const runwayPhases = (workspace.runway_state?.phases as RunwayPhase[]) ?? [];
  const runwayProgress = getRunwayProgress(runwayPhases, workspace.runway_state ?? {});
  const totalRevenue = getTotalRevenue(workspace.revenue_entries ?? []);
  const daysUntilLaunch = getDaysUntilLaunch(workspace.launch_date);
  const contentStreak = getContentStreak(workspace.content_state ?? {});
  const milestones: string[] = workspace.milestones ?? [];
  const weeklyPlan = workspace.content_state?.weekly_plan as WeeklyPlan | undefined;

  // Top runway task (first incomplete item)
  let topTask: string | null = null;
  for (let pi = 0; pi < runwayPhases.length; pi++) {
    const phase: RunwayPhase = runwayPhases[pi];
    for (let ii = 0; ii < (phase.items ?? []).length; ii++) {
      if (!workspace.runway_state?.[`${pi}_${ii}`]) {
        topTask = phase.items[ii];
        break;
      }
    }
    if (topTask) break;
  }

  // Today's content prompt (first incomplete)
  const contentPrompts = (workspace.content_state?.prompts as ContentPrompt[]) ?? [];
  const todayPrompt = contentPrompts.find(
    (p: ContentPrompt) => !workspace.content_state?.[String(p.day)]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-text-primary text-2xl font-bold">
          Hey, {workspace.buyer_name}!
        </h2>
        <p className="text-text-muted text-sm mt-1">
          {workspace.business_name} command centre
        </p>
      </div>

      {/* Milestones */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: "#141312", border: "1px solid #1F1E1C" }}
      >
        <p className="text-text-subtle text-xs uppercase tracking-widest mb-3">
          Milestones
        </p>
        <MilestoneBar milestones={milestones} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Launch Countdown"
          value={
            daysUntilLaunch !== null
              ? daysUntilLaunch > 0
                ? `${daysUntilLaunch}d`
                : "Launched!"
              : "..."
          }
          sub={workspace.launch_date ?? "Set a date"}
          icon={Rocket}
          onClick={() => onTabChange("runway")}
        />
        <StatCard
          label="Runway Progress"
          value={`${runwayProgress}%`}
          sub={`${runwayProgress < 100 ? "In progress" : "Complete!"}`}
          icon={TrendingUp}
          onClick={() => onTabChange("runway")}
        />
        <StatCard
          label="Monthly Goal"
          value={formatCurrency(workspace.monthly_revenue_goal ?? 0)}
          sub={`${formatCurrency(totalRevenue)} earned so far`}
          icon={Target}
          onClick={() => onTabChange("money")}
        />
        <StatCard
          label="Content Streak"
          value={contentStreak > 0 ? `${contentStreak} days` : "Start today"}
          sub="consecutive posts done"
          icon={Flame}
          onClick={() => onTabChange("content")}
        />
      </div>

      {/* This Week's Focus */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ backgroundColor: "#141312", border: "1px solid #1F1E1C" }}
      >
        <p className="text-text-subtle text-xs uppercase tracking-widest">
          This Week&apos;s Focus
        </p>

        <div className="space-y-3">
          {topTask && (
            <FocusItem
              label="Top Priority"
              text={topTask}
              onClick={() => onTabChange("runway")}
            />
          )}
          {todayPrompt && (
            <FocusItem
              label="Content Prompt"
              text={`Day ${todayPrompt.day}: ${todayPrompt.prompt}`}
              onClick={() => onTabChange("content")}
            />
          )}
          <FocusItem
            label="Money Check-In"
            text={`You've earned ${formatCurrency(totalRevenue)} of your ${formatCurrency(
              workspace.monthly_revenue_goal ?? 0
            )} goal.`}
            onClick={() => onTabChange("money")}
          />
        </div>
      </div>

      {/* Weekly Planner */}
      {weeklyPlan && weeklyPlan.blocks?.length > 0 && (
        <WeeklyPlanner weeklyPlan={weeklyPlan} />
      )}

      {/* AI Coach CTA */}
      <button
        onClick={() => onTabChange("coach")}
        className="w-full rounded-xl p-4 flex items-center justify-between group transition-colors"
        style={{
          backgroundColor: "var(--brand-color-10)",
          border: "1px solid var(--brand-color)",
        }}
      >
        <div className="text-left">
          <p className="font-semibold text-text-primary text-sm">Ask your AI coach</p>
          <p className="text-text-muted text-xs mt-0.5">
            {workspace.ai_messages_remaining} messages remaining
          </p>
        </div>
        <ArrowRight
          size={18}
          style={{ color: "var(--brand-color)" }}
          className="group-hover:translate-x-1 transition-transform"
        />
      </button>
    </div>
  );
}

function FocusItem({
  label,
  text,
  onClick,
}: {
  label: string;
  text: string;
  onClick?: () => void;
}) {
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-bg-cardHover transition-colors"
      onClick={onClick}
    >
      <div
        className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: "var(--brand-color)", marginTop: "6px" }}
      />
      <div>
        <p className="text-xs text-text-subtle uppercase tracking-widest">{label}</p>
        <p className="text-text-secondary text-sm mt-0.5">{text}</p>
      </div>
      <ArrowRight size={14} className="ml-auto mt-1 text-text-ghost flex-shrink-0" />
    </div>
  );
}
