ALTER TABLE "setup" ADD COLUMN "is_password_created" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "setup" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "setup" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "setup" ADD COLUMN "deleted_at" timestamp;