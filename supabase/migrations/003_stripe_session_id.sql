-- Add stripe_session_id to workspaces for payment-first intake flow.
-- The thank-you page passes session_id to Tally, which forwards it in the
-- webhook. /api/intake verifies the Stripe session is paid before creating
-- a workspace, and stores the session_id for idempotency + audit.

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS workspaces_stripe_session_id_idx
  ON workspaces (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
