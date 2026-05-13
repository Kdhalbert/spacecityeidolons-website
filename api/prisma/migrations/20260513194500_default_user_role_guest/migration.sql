-- Set new default role for users to GUEST.
ALTER TABLE "users"
ALTER COLUMN "role"
SET DEFAULT 'GUEST';