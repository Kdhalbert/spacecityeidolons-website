-- Migration: add_pending_game_request_unique_index
-- Adds a partial unique index so that at most one PENDING request
-- can exist for any given game name, preventing race-condition duplicates.

CREATE UNIQUE INDEX "game_page_requests_pending_gamename_unique"
  ON "game_page_requests" ("gameName")
  WHERE "status" = 'PENDING';
