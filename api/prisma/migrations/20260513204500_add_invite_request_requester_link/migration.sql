ALTER TABLE "invite_requests"
ADD COLUMN "requesterUserId" TEXT;

CREATE INDEX "invite_requests_requesterUserId_idx"
ON "invite_requests"("requesterUserId");

ALTER TABLE "invite_requests"
ADD CONSTRAINT "invite_requests_requesterUserId_fkey"
FOREIGN KEY ("requesterUserId") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
