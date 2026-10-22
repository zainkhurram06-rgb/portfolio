-- A staff member can never be booked twice for overlapping times, even if two
-- customers press "book" at the same second. The database refuses it.
CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_overlap"
  EXCLUDE USING gist ("staff_id" WITH =, tstzrange("starts_at", "ends_at") WITH &&)
  WHERE ("status" IN ('confirmed', 'completed'));
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ends_after_start" CHECK ("ends_at" > "starts_at");
--> statement-breakpoint
ALTER TABLE "hours" ADD CONSTRAINT "hours_valid" CHECK ("weekday" BETWEEN 1 AND 7 AND "start_min" >= 0 AND "end_min" <= 1440 AND "end_min" > "start_min");
