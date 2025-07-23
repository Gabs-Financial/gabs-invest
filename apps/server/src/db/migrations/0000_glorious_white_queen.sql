CREATE TYPE "public"."account_status" AS ENUM('active', 'open', 'blocked', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('savings', 'current');--> statement-breakpoint
CREATE TYPE "public"."asset_category" AS ENUM('mutual_funds', 'alt_investment', 'money_market_fund', 'treasury_bills');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'blocked', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."bill_type" AS ENUM('airtime', 'data', 'electricity', 'television');--> statement-breakpoint
CREATE TYPE "public"."employment_status" AS ENUM('Employed', 'Unemployed', 'Self-Employed');--> statement-breakpoint
CREATE TYPE "public"."portfolio_type" AS ENUM('single', 'multi');--> statement-breakpoint
CREATE TYPE "public"."investment_frequency" AS ENUM('weekly', 'monthly', 'quarterly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."investment_horizon" AS ENUM('short', 'medium', 'long');--> statement-breakpoint
CREATE TYPE "public"."portfolio_currency" AS ENUM('NGN', 'US');--> statement-breakpoint
CREATE TYPE "public"."risk_tolerance" AS ENUM('high', 'moderate', 'low');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('NIP_Transfer', 'Book_Transfer', 'Investment_Transfer');--> statement-breakpoint
CREATE TYPE "public"."transfer_type" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TYPE "public"."user_gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."medium" AS ENUM('friend', 'referral', 'facebook', 'instagram', 'google', 'twitter', 'linkedin', 'others');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('web', 'mobile');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_type" "type" DEFAULT 'savings' NOT NULL,
	"user_id" uuid NOT NULL,
	"account_provider" varchar NOT NULL,
	"provider_account_id" varchar NOT NULL,
	"currency" varchar DEFAULT 'NGN' NOT NULL,
	"status" "account_status" DEFAULT 'open',
	"balance" integer DEFAULT 0 NOT NULL,
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
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"category" "asset_category" NOT NULL,
	"amount" integer NOT NULL,
	"min_amount" integer NOT NULL,
	"max_amount" integer NOT NULL,
	"attributes" jsonb NOT NULL,
	"summary" text NOT NULL,
	"status" "status",
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "assets_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "beneficiary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"counterparty_id" varchar,
	"account_name" varchar NOT NULL,
	"account_number" varchar NOT NULL,
	"bank_name" varchar NOT NULL,
	"bank_code" varchar NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "beneficiary_id_unique" UNIQUE("id"),
	CONSTRAINT "beneficiary_counterparty_id_unique" UNIQUE("counterparty_id"),
	CONSTRAINT "beneficiary_account_number_unique" UNIQUE("account_number")
);
--> statement-breakpoint
CREATE TABLE "bill_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "status" NOT NULL,
	"type" "bill_type" NOT NULL,
	"reference" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"external_bill_id" varchar NOT NULL,
	"amount" integer NOT NULL,
	"attributes" jsonb NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "bill_payment_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "portfolio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"risk_tolerance" "risk_tolerance",
	"occupation" varchar,
	"investment_target" integer,
	"investment_frequency" "investment_frequency",
	"investment_horizon" "investment_horizon",
	"investment_objectives" varchar[],
	"enable_reminder" boolean DEFAULT true,
	"auto_invest" boolean DEFAULT false,
	"monthly_income" integer,
	"is_portfolio_created" boolean DEFAULT false,
	"monthly_investment_amount" integer,
	"employment_status" "employment_status",
	"display_currency" "portfolio_currency" DEFAULT 'NGN',
	"enable_multi_portfolio" boolean DEFAULT false,
	"source_of_income" varchar,
	"portfolio_type" "portfolio_type" DEFAULT 'single' NOT NULL,
	"preferred_assets" varchar[],
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
CREATE TABLE "setup" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"is_avatar_uploaded" boolean DEFAULT false,
	"is_tag_created" boolean DEFAULT false,
	"is_notification_enabled" boolean DEFAULT false,
	"is_account_funded" boolean DEFAULT false,
	"is_email_verified" boolean DEFAULT false,
	"is_phone_verified" boolean DEFAULT false,
	"is_address_verified" boolean DEFAULT false,
	"is_address_provided" boolean DEFAULT false,
	"is_identity_verified" boolean DEFAULT false,
	"is_bvn_provided" boolean DEFAULT false,
	"has_created_transactionPin" boolean DEFAULT false,
	"is_account_created" boolean DEFAULT false,
	"is_portfolio_profile" boolean DEFAULT false,
	CONSTRAINT "setup_id_unique" UNIQUE("id")
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
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"reference" varchar NOT NULL,
	"narration" varchar,
	"fee" integer,
	"transfer_type" "transfer_type" NOT NULL,
	"transaction_type" "transaction_type" NOT NULL,
	"balance_before" integer,
	"balance_after" integer,
	"currency" varchar DEFAULT 'NGN',
	"summary" varchar,
	"sender" jsonb,
	"recipient" jsonb NOT NULL,
	"meta_data" jsonb,
	"session_id" uuid,
	"amount" integer NOT NULL,
	"payment_amount" integer,
	"initiated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"status" "status" NOT NULL,
	"failure_reason" varchar,
	"channel" varchar DEFAULT 'mobile',
	"external_reference" varchar,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "transactions_id_unique" UNIQUE("id")
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
	"has_onboarded" boolean DEFAULT false,
	"password" varchar,
	"phone_number" varchar,
	"bvn_phone_number" varchar,
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
	"nin" varchar,
	"avatar" varchar,
	"medium" "medium",
	"date_of_birth" varchar,
	"is_flagged" boolean,
	"platform" "platform",
	"terms" boolean DEFAULT true,
	"address" jsonb,
	"passcode" varchar,
	"secure_pin" varchar,
	"refresh_token" varchar[],
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "user_id_unique" UNIQUE("id"),
	CONSTRAINT "user_account_ref_unique" UNIQUE("account_ref"),
	CONSTRAINT "user_gabs_tag_unique" UNIQUE("gabs_tag"),
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "user_bvn_phone_number_unique" UNIQUE("bvn_phone_number"),
	CONSTRAINT "user_referral_code_unique" UNIQUE("referral_code"),
	CONSTRAINT "user_referral_link_unique" UNIQUE("referral_link")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beneficiary" ADD CONSTRAINT "beneficiary_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beneficiary" ADD CONSTRAINT "beneficiary_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_payment" ADD CONSTRAINT "bill_payment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setup" ADD CONSTRAINT "setup_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token" ADD CONSTRAINT "token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON DELETE no action ON UPDATE no action;