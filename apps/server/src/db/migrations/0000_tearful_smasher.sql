CREATE TYPE "public"."account_status" AS ENUM('active', 'open', 'blocked', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('Savings', 'Current');--> statement-breakpoint
CREATE TYPE "public"."investment_frequency" AS ENUM('weekly', 'monthly', 'quarterly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."investment_horizon" AS ENUM('short', 'medium', 'long');--> statement-breakpoint
CREATE TYPE "public"."portfolio_currency" AS ENUM('NGN', 'US');--> statement-breakpoint
CREATE TYPE "public"."risk_tolerance" AS ENUM('high', 'moderate', 'low');--> statement-breakpoint
CREATE TYPE "public"."user_gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."medium" AS ENUM('friend', 'referral', 'facebook', 'instagram', 'google', 'twitter', 'linkedin', 'others');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('web', 'mobile');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'blocked', 'inactive');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_type" "type" DEFAULT 'Savings' NOT NULL,
	"user_id" uuid NOT NULL,
	"account_provider" varchar NOT NULL,
	"provider_account_id" varchar NOT NULL,
	"currency" varchar DEFAULT 'NGN' NOT NULL,
	"status" "account_status" DEFAULT 'open',
	"balance" integer DEFAULT 0,
	"ledger_balance" integer DEFAULT 0,
	"hold_balance" integer DEFAULT 0,
	"available_balance" integer DEFAULT 0,
	"alias" varchar NOT NULL,
	"account_name" varchar NOT NULL,
	"account_number" varchar NOT NULL,
	"bank_name" varchar NOT NULL,
	"bank_code" varchar NOT NULL,
	"account_purpose" varchar,
	"frozen" boolean DEFAULT false,
	"meta_data" jsonb,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "accounts_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "portfolio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"risk_tolerance" "risk_tolerance" NOT NULL,
	"occupation" varchar NOT NULL,
	"investment_target" integer,
	"investment_frequency" "investment_frequency",
	"investment_horizon" "investment_horizon",
	"investment_objectives" varchar[],
	"enable_reminder" boolean DEFAULT true,
	"enable_automatic_rebalancing" boolean DEFAULT false,
	"auto_invest" boolean DEFAULT false,
	"monthly_income" integer,
	"is_portfolio_created" boolean DEFAULT false,
	"monthly_investment_amount" integer,
	"ai_recommendations" boolean DEFAULT true,
	"display_currency" "portfolio_currency" DEFAULT 'NGN',
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "portfolio_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	"user_agent" varchar,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "session_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "token" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar NOT NULL,
	"type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"middle_name" varchar,
	"account_ref" uuid DEFAULT gen_random_uuid(),
	"full_name" varchar,
	"gabs_tag" varchar,
	"email" varchar,
	"is_email_verified" boolean,
	"is_phone_verified" boolean,
	"has_onboarded" boolean DEFAULT false,
	"password" varchar,
	"phone_number" varchar,
	"country" varchar DEFAULT 'NG',
	"status" "status" DEFAULT 'active',
	"referral_code" varchar,
	"referral_link" varchar,
	"referred_by" uuid,
	"referrals" uuid[] DEFAULT '{}'::uuid[],
	"gender" "user_gender",
	"providers" jsonb,
	"bvn" varchar,
	"kyc_level" integer DEFAULT 0,
	"is_address_verified" boolean DEFAULT false,
	"is_bvn_verified" boolean DEFAULT false,
	"nin" varchar,
	"avatar" varchar,
	"medium" "medium",
	"date_of_birth" varchar,
	"is_flagged" boolean,
	"platform" "platform",
	"terms" boolean DEFAULT true,
	"address" jsonb,
	"passcode" varchar,
	"transactionPin" integer,
	"refresh_token" varchar[],
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "user_id_unique" UNIQUE("id"),
	CONSTRAINT "user_account_ref_unique" UNIQUE("account_ref"),
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "user_referral_code_unique" UNIQUE("referral_code"),
	CONSTRAINT "user_referral_link_unique" UNIQUE("referral_link")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token" ADD CONSTRAINT "token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;