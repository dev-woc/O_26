CREATE TABLE "bcn_admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" text NOT NULL,
	"volunteer_id" uuid NOT NULL,
	"admin_level" text DEFAULT 'standard' NOT NULL,
	"can_distribute_coins" boolean DEFAULT true NOT NULL,
	"max_coin_distribution_amount" numeric(18, 8) DEFAULT '500' NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_secret" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bcn_admins_admin_id_unique" UNIQUE("admin_id"),
	CONSTRAINT "bcn_admins_volunteer_id_unique" UNIQUE("volunteer_id")
);
--> statement-breakpoint
CREATE TABLE "bcn_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid NOT NULL,
	"actor_role" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" uuid,
	"changes_json" jsonb,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bcn_coin_distributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_id" uuid,
	"volunteer_id" uuid,
	"task_id" uuid,
	"admin_id" uuid NOT NULL,
	"amount" numeric(18, 8) NOT NULL,
	"distribution_type" text NOT NULL,
	"description" text,
	"approval_status" text DEFAULT 'approved' NOT NULL,
	"blockchain_hash" text,
	"notes" text,
	"distribution_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bcn_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"estimated_hours" numeric(5, 2),
	"reward_amount" numeric(18, 8),
	"due_date" timestamp with time zone,
	"required_skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"location_lat" numeric(10, 8),
	"location_lng" numeric(11, 8),
	"created_by" uuid,
	"assigned_to" uuid,
	"hours_worked" numeric(5, 2),
	"completion_notes" text,
	"completed_at" timestamp with time zone,
	"approved_by" uuid,
	"reward_adjustment" numeric(18, 8),
	"approval_notes" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bcn_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unique_identifier" text NOT NULL,
	"wallet_address" text,
	"coin_balance" numeric(18, 8) DEFAULT '0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"privacy_settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bcn_users_unique_identifier_unique" UNIQUE("unique_identifier"),
	CONSTRAINT "bcn_users_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
CREATE TABLE "bcn_volunteers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"volunteer_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"phone" text,
	"organization" text,
	"bio" text DEFAULT '' NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"availability" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"role" text DEFAULT 'volunteer' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"background_check_date" text,
	"training_completed_date" text,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bcn_volunteers_volunteer_id_unique" UNIQUE("volunteer_id"),
	CONSTRAINT "bcn_volunteers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DROP TABLE "click_events" CASCADE;--> statement-breakpoint
DROP TABLE "link_items" CASCADE;--> statement-breakpoint
DROP TABLE "profiles" CASCADE;--> statement-breakpoint
ALTER TABLE "bcn_admins" ADD CONSTRAINT "bcn_admins_volunteer_id_bcn_volunteers_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."bcn_volunteers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bcn_coin_distributions" ADD CONSTRAINT "bcn_coin_distributions_recipient_id_bcn_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."bcn_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bcn_coin_distributions" ADD CONSTRAINT "bcn_coin_distributions_volunteer_id_bcn_volunteers_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."bcn_volunteers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bcn_coin_distributions" ADD CONSTRAINT "bcn_coin_distributions_task_id_bcn_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."bcn_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bcn_coin_distributions" ADD CONSTRAINT "bcn_coin_distributions_admin_id_bcn_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."bcn_admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bcn_tasks" ADD CONSTRAINT "bcn_tasks_created_by_bcn_admins_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."bcn_admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bcn_tasks" ADD CONSTRAINT "bcn_tasks_assigned_to_bcn_volunteers_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."bcn_volunteers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bcn_tasks" ADD CONSTRAINT "bcn_tasks_approved_by_bcn_admins_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."bcn_admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_bcn_admins_admin_id" ON "bcn_admins" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_bcn_admins_volunteer_id" ON "bcn_admins" USING btree ("volunteer_id");--> statement-breakpoint
CREATE INDEX "idx_bcn_audit_log_actor_id" ON "bcn_audit_log" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_bcn_audit_log_action" ON "bcn_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_bcn_audit_log_created_at" ON "bcn_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_bcn_distributions_admin_id" ON "bcn_coin_distributions" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_bcn_distributions_recipient_id" ON "bcn_coin_distributions" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "idx_bcn_distributions_date" ON "bcn_coin_distributions" USING btree ("distribution_date");--> statement-breakpoint
CREATE INDEX "idx_bcn_tasks_status" ON "bcn_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_bcn_tasks_assigned_to" ON "bcn_tasks" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "idx_bcn_tasks_created_by" ON "bcn_tasks" USING btree ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_bcn_users_unique_identifier" ON "bcn_users" USING btree ("unique_identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_bcn_volunteers_email" ON "bcn_volunteers" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_bcn_volunteers_volunteer_id" ON "bcn_volunteers" USING btree ("volunteer_id");