export interface Workspace {
  id: string;
  slug: string;
  access_token: string;

  // Buyer info
  buyer_name: string;
  buyer_email: string;
  business_name: string;
  business_type: string;
  tagline: string | null;
  platforms: string[];
  revenue_model: string | null;
  target_audience: string | null;
  launch_date: string | null;
  monthly_revenue_goal: number | null;
  startup_budget: number | null;
  brand_color: string;
  experience_level: string | null;

  // System state
  runway_state: WorkspaceRunwayState;
  content_state: WorkspaceContentState;
  revenue_entries: RevenueEntry[];
  milestones: string[];
  offer_card: OfferCard;

  // AI Coach
  ai_messages_remaining: number;
  ai_conversation: AIMessage[];

  // Metadata
  created_at: string;
  last_active_at: string;
  bonus_unlocked: boolean;
  stripe_customer_id: string | null;
}

// Stored in runway_state JSONB column
export interface WorkspaceRunwayState {
  needs_generation?: boolean;
  phases?: RunwayPhase[];
  pricing_guide?: PricingTier[];
  startup_costs?: StartupCost[];
  first_customers?: FirstCustomerStep[];
  ready_checklist?: ReadyChecklistItem[];
  [key: string]: boolean | RunwayPhase[] | PricingTier[] | StartupCost[] | FirstCustomerStep[] | ReadyChecklistItem[] | undefined;
}

// Stored in content_state JSONB column
export interface WorkspaceContentState {
  needs_generation?: boolean;
  prompts?: ContentPrompt[];
  weekly_plan?: WeeklyPlan;
  [key: string]: boolean | ContentPrompt[] | WeeklyPlan | undefined;
}

export interface RunwayPhase {
  name: string;
  items: string[];
}

export interface RevenueEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
}

export interface OfferCard {
  headline?: string;
  tagline?: string;
  what?: string;
  platforms?: string;
}

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ContentPrompt {
  day: number;
  prompt: string;
  platform: string;
  type: "Reel" | "Story" | "Carousel" | "Photo" | "Video" | "Post";
}

export interface PricingTier {
  tier: "Entry" | "Core" | "Premium";
  range: string;
  description: string;
}

export interface StartupCost {
  name: string;
  amount: number;
}

// Feature 2: First 10 Customers
export interface FirstCustomerStep {
  step: number;
  action: string;
  detail: string;
  platform: string;
}

// Feature 3: Weekly Time Planner
export interface TimeBlock {
  day: string;
  task: string;
  minutes: number;
  category: "build" | "content" | "outreach" | "admin";
}

export interface WeeklyPlan {
  suggested_hours: number;
  blocks: TimeBlock[];
}

// Feature 4: Ready to Sell Checklist
export interface ReadyChecklistItem {
  item: string;
  category: "product" | "brand" | "sales" | "legal";
}
