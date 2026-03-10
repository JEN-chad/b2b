DO $$ BEGIN
 CREATE TYPE "deal_task_assigned_to" AS ENUM('BUYER', 'SELLER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "escrow_status" AS ENUM('PENDING', 'FUNDED', 'RELEASED', 'REFUNDED', 'FAILED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deal_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_room_id" uuid NOT NULL,
	"title" text NOT NULL,
	"assigned_to" "deal_task_assigned_to" NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "escrow_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_room_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"external_id" text NOT NULL,
	"amount" integer NOT NULL,
	"status" "escrow_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deal_tasks" ADD CONSTRAINT "deal_tasks_deal_room_id_deal_rooms_id_fk" FOREIGN KEY ("deal_room_id") REFERENCES "deal_rooms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_deal_room_id_deal_rooms_id_fk" FOREIGN KEY ("deal_room_id") REFERENCES "deal_rooms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
