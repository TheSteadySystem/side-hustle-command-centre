-- ============================================================
-- Side Hustle Command Centre — Supabase Migration
-- Run this in your Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- Table: workspaces
-- One row per buyer. All personalized content lives here.
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(12) UNIQUE NOT NULL,
  access_token VARCHAR(64) UNIQUE NOT NULL,

  -- Buyer info (populated by n8n after Tally intake)
  buyer_name VARCHAR(100) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,
  business_name VARCHAR(200) NOT NULL,
  business_type VARCHAR(200) NOT NULL,
  tagline VARCHAR(300),
  platforms JSONB DEFAULT '[]',
  revenue_model VARCHAR(100),
  target_audience TEXT,
  launch_date DATE,
  monthly_revenue_goal INTEGER,
  startup_budget INTEGER,
  brand_color VARCHAR(7) DEFAULT '#B8860B',
  experience_level VARCHAR(50),

  -- System state (updated by frontend via PATCH /api/workspace/update)
  runway_state JSONB DEFAULT '{}',       -- includes phases array + completion keys
  content_state JSONB DEFAULT '{}',      -- includes prompts array + completion keys
  revenue_entries JSONB DEFAULT '[]',    -- [{id, date, description, amount, type}]
  milestones JSONB DEFAULT '[]',         -- ["system_activated", "first_sale", ...]
  offer_card JSONB DEFAULT '{}',         -- {headline, tagline, what, platforms}

  -- AI Coach
  ai_messages_remaining INTEGER DEFAULT 50,
  ai_conversation JSONB DEFAULT '[]',    -- [{role, content, timestamp}]

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  bonus_unlocked BOOLEAN DEFAULT FALSE,

  -- Stripe
  stripe_customer_id VARCHAR(100)
);

-- Indexes
CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_workspaces_access_token ON workspaces(access_token);
CREATE INDEX idx_workspaces_buyer_email ON workspaces(buyer_email);

-- Table: message_pack_purchases
CREATE TABLE message_pack_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  stripe_payment_id VARCHAR(100),
  messages_added INTEGER DEFAULT 50,
  amount_cents INTEGER DEFAULT 500,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
-- Access is handled at API route level via access_token + service_role key.
-- No Supabase auth users — never expose anon key for data reads.
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_pack_purchases ENABLE ROW LEVEL SECURITY;

-- Block all direct client access (API routes use service_role key which bypasses RLS)
CREATE POLICY "No direct access" ON workspaces FOR ALL USING (false);
CREATE POLICY "No direct access" ON message_pack_purchases FOR ALL USING (false);

-- ============================================================
-- NOTES FOR SETUP:
-- 1. Go to supabase.com → your project → SQL Editor
-- 2. Paste and run this entire file
-- 3. Copy your project URL and service_role key from Settings → API
-- 4. Add them to .env.local:
--    SUPABASE_URL=https://your-project.supabase.co
--    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
-- ============================================================
