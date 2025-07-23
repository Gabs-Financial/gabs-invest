ALTER TABLE "setup" RENAME COLUMN "is_portfolio_profile" TO "has_created_portfolio_profile";--> statement-breakpoint
ALTER TABLE "setup" ADD COLUMN "has_created_passcode" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "setup" ADD COLUMN "has_completed_onboarding" boolean DEFAULT false;