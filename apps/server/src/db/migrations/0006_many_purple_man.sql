CREATE TABLE "investment_offering" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"summary" text NOT NULL,
	"icon" varchar NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "investment_offering_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "assets" RENAME TO "mutual_fund_asset";--> statement-breakpoint
ALTER TABLE "mutual_fund_asset" DROP CONSTRAINT "assets_id_unique";--> statement-breakpoint
ALTER TABLE "mutual_fund_asset" ADD COLUMN "return_type" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "mutual_fund_asset" ADD COLUMN "fund_composiiton" jsonb;--> statement-breakpoint
ALTER TABLE "mutual_fund_asset" ADD COLUMN "trustee" varchar;--> statement-breakpoint
ALTER TABLE "mutual_fund_asset" ADD COLUMN "custodian" varchar;--> statement-breakpoint
ALTER TABLE "mutual_fund_asset" ADD COLUMN "unit_price" integer;--> statement-breakpoint
ALTER TABLE "mutual_fund_asset" ADD COLUMN "minimum_hold_period" varchar;--> statement-breakpoint
ALTER TABLE "mutual_fund_asset" ADD COLUMN "maximum_hold_period" varchar;--> statement-breakpoint
ALTER TABLE "mutual_fund_asset" ADD COLUMN "minimum_investment" integer;--> statement-breakpoint
ALTER TABLE "mutual_fund_asset" ADD COLUMN "maximum_investment" integer;--> statement-breakpoint
ALTER TABLE "mutual_fund_asset" ADD COLUMN "management_fee" integer;--> statement-breakpoint
ALTER TABLE "setup" ADD COLUMN "has_sync_contatcts" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "mutual_fund_asset" DROP COLUMN "min_amount";--> statement-breakpoint
ALTER TABLE "mutual_fund_asset" DROP COLUMN "max_amount";--> statement-breakpoint
ALTER TABLE "mutual_fund_asset" ADD CONSTRAINT "mutual_fund_asset_id_unique" UNIQUE("id");