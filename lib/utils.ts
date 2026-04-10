import { RevenueEntry, RunwayPhase, WorkspaceRunwayState, WorkspaceContentState } from "./types";

export function generateSlug(businessName: string): string {
  const base = businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join("-");
  const suffix = Math.random().toString(36).substring(2, 4);
  return `${base}-${suffix}`.substring(0, 12);
}

export function generateToken(length = 64): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function getBrandColorFromBusinessType(type: string): string {
  const colorMap: Record<string, string> = {
    "Handmade Products": "#B8860B",
    "Digital Products": "#6366F1",
    "Services": "#0EA5E9",
    "Food & Beverage": "#F59E0B",
    "Fashion & Accessories": "#EC4899",
    "Health & Wellness": "#10B981",
    "Creative Services": "#8B5CF6",
    "Other": "#B8860B",
  };
  for (const [key, color] of Object.entries(colorMap)) {
    if (type.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return "#B8860B";
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getRunwayProgress(
  phases: RunwayPhase[],
  state: WorkspaceRunwayState
): number {
  let total = 0;
  let done = 0;
  phases.forEach((phase, pi) => {
    phase.items.forEach((_item, ii) => {
      total++;
      if (state[`${pi}_${ii}`]) done++;
    });
  });
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export function getTotalRevenue(entries: RevenueEntry[]): number {
  return entries
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getTotalExpenses(entries: RevenueEntry[]): number {
  return entries
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getContentStreak(contentState: WorkspaceContentState): number {
  let streak = 0;
  let day = 1;
  while (contentState[String(day)]) {
    streak++;
    day++;
  }
  return streak;
}

export function getDaysUntilLaunch(launchDate: string | null): number | null {
  if (!launchDate) return null;
  const diff = new Date(launchDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getMilestoneLabel(milestone: string): string {
  const labels: Record<string, string> = {
    system_activated: "System Activated",
    first_task: "First Step Taken",
    runway_halfway: "Halfway There",
    runway_complete: "Runway Complete",
    first_content: "First Post Done",
    content_week: "7-Day Content Streak",
    first_sale: "First Sale",
    goal_hit: "Revenue Goal Hit",
  };
  return labels[milestone] ?? milestone;
}

export function workspaceUrl(slug: string, token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.sidehustlecommandcentre.com";
  return `${base}/${slug}?t=${token}`;
}
