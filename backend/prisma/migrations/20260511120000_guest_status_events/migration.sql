-- CreateTable
CREATE TABLE "guest_status_events" (
    "id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "status" "GuestStatus" NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "guest_status_events_guest_id_idx" ON "guest_status_events"("guest_id");

-- CreateIndex
CREATE INDEX "guest_status_events_recorded_at_idx" ON "guest_status_events"("recorded_at");

-- AddForeignKey
ALTER TABLE "guest_status_events" ADD CONSTRAINT "guest_status_events_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill initial status snapshot per guest (for timeline before live events)
INSERT INTO "guest_status_events" ("id", "guest_id", "status", "recorded_at")
SELECT gen_random_uuid()::text, "id", "status", "created_at" FROM "guests";
