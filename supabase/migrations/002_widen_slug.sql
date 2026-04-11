-- Widen slug column to support longer slugs (was 12, now 24)
ALTER TABLE workspaces ALTER COLUMN slug TYPE VARCHAR(24);
