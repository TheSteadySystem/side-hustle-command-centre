-- Add gumroad_sale_id to workspaces for payment-first intake via Gumroad.
-- Mirrors the stripe_session_id column from migration 003.

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS gumroad_sale_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS workspaces_gumroad_sale_id_idx
  ON workspaces (gumroad_sale_id)
  WHERE gumroad_sale_id IS NOT NULL;
