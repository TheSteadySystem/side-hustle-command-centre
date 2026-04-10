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
// Contains both the phase data AND per-item completion state keys (e.g. "0_1": true)
export interface WorkspaceRunwayState {
  phases?: RunwayPhase[];
  pricing_guide?: PricingTier[];
  startup_costs?: StartupCost[];
  [key: string]: boolean | RunwayPhase[] | PricingTier[] | StartupCost[] | undefined;
}

// Stored in content_state JSONB column
// Contains both the prompts array AND per-day completion keys (e.g. "1": true)
export interface WorkspaceContentState {
  prompts?: ContentPrompt[];
  [key: string]: boolean | ContentPrompt[] | undefined;
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

export interface GeneratedContent {
  runway: RunwayPhase[];
  content_prompts: ContentPrompt[];
  offer_card: OfferCard;
  pricing_guide: PricingTier[];
  startup_costs: StartupCost[];
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
