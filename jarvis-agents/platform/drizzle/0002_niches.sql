ALTER TABLE "businesses" ALTER COLUMN "niche" SET DATA TYPE text;--> statement-breakpoint
-- the old catch-all "clinic" niche becomes "dental"; medical and dermatology are new
UPDATE "businesses" SET "niche" = 'dental' WHERE "niche" = 'clinic';--> statement-breakpoint
DROP TYPE "public"."niche";--> statement-breakpoint
CREATE TYPE "public"."niche" AS ENUM('salon', 'dental', 'homeservices', 'medical', 'dermatology', 'carwash', 'autorepair');--> statement-breakpoint
ALTER TABLE "businesses" ALTER COLUMN "niche" SET DATA TYPE "public"."niche" USING "niche"::"public"."niche";--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "details" jsonb DEFAULT '{}'::jsonb NOT NULL;