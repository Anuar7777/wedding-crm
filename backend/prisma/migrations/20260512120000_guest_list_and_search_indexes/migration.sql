-- List guests: filter by type + order by created_at desc
DROP INDEX IF EXISTS "guests_type_idx";
CREATE INDEX "guests_type_created_at_idx" ON "guests" ("type", "created_at" DESC);

-- Case-insensitive substring search on full_name (used with ILIKE %term%)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "guests_full_name_trgm_idx" ON "guests" USING gin ("full_name" gin_trgm_ops);
