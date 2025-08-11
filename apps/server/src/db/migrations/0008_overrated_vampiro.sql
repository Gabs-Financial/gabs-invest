CREATE TYPE "public"."investment_status" AS ENUM('active', 'inactive', 'pending', 'completed');--> statement-breakpoint
CREATE TYPE "public"."investment_type" AS ENUM('mutual_funds', 'treasury_bills', 'fixed_deposit', 'bonds', 'stocks', 'alts');--> statement-breakpoint
CREATE TABLE "investment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"asset_id" uuid NOT NULL,
	"withdrawn" boolean DEFAULT false NOT NULL,
	"liquidated" boolean DEFAULT false NOT NULL,
	"amount" integer NOT NULL,
	"status" "investment_status" NOT NULL,
	"reinvest" boolean DEFAULT false NOT NULL,
	"maturity_date" varchar NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "investment_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "mutual_fund_asset" RENAME TO "mutual_funds";--> statement-breakpoint
ALTER TABLE "investment_offering" RENAME COLUMN "icon" TO "main_image";--> statement-breakpoint
ALTER TABLE "mutual_funds" DROP CONSTRAINT "mutual_fund_asset_id_unique";--> statement-breakpoint
ALTER TABLE "mutual_funds" ALTER COLUMN "management_fee" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "investment_offering" ADD COLUMN "category" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "investment_offering" ADD COLUMN "available" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "investment_offering" DROP COLUMN "label";--> statement-breakpoint
ALTER TABLE "mutual_funds" ADD CONSTRAINT "mutual_funds_id_unique" UNIQUE("id");