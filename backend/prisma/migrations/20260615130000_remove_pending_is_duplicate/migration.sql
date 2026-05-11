-- Normalize legacy status before enum change
UPDATE "guests" SET "status" = 'ATTENDING' WHERE "status" = 'PENDING';
UPDATE "guest_status_events" SET "status" = 'ATTENDING' WHERE "status" = 'PENDING';

-- Replace GuestStatus enum (drop PENDING)
CREATE TYPE "GuestStatus_new" AS ENUM ('ATTENDING', 'ATTENDING_WITH_SPOUSE', 'DECLINED');

ALTER TABLE "guests" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "guests"
  ALTER COLUMN "status" TYPE "GuestStatus_new"
  USING ("status"::text::"GuestStatus_new");

ALTER TABLE "guest_status_events"
  ALTER COLUMN "status" TYPE "GuestStatus_new"
  USING ("status"::text::"GuestStatus_new");

DROP TYPE "GuestStatus";

ALTER TYPE "GuestStatus_new" RENAME TO "GuestStatus";

ALTER TABLE "guests" ALTER COLUMN "status" SET DEFAULT 'ATTENDING'::"GuestStatus";

ALTER TABLE "guests" DROP COLUMN "is_duplicate";

-- System tag for duplicate detection (per event type)
INSERT INTO "tags" ("id", "name", "type")
SELECT gen_random_uuid()::text, 'Дубликаты', v::"EventType"
FROM (VALUES ('WEDDING'::"EventType"), ('BRIDE_FAREWELL'::"EventType")) AS t(v)
ON CONFLICT ("name", "type") DO NOTHING;
