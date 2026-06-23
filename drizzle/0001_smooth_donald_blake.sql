CREATE TABLE "conversations" (
	"id_conversation" serial PRIMARY KEY NOT NULL,
	"id_request" integer,
	"id_chief" text NOT NULL,
	"id_customer" text NOT NULL,
	"statut" varchar(50) DEFAULT 'a_repondre' NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id_notification" serial PRIMARY KEY NOT NULL,
	"id_user" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"id_request" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "services" CASCADE;--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_id_recipient_users_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_id_sender_users_id_fk";
--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "expected_time_request" varchar(5);--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "chief_message" text;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "chief_price_per_person" integer;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "chief_menu_pdf_url" varchar(500);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "id_conversation" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "type" varchar(50) DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "id_menu" integer;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "price_per_person" integer;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_id_request_requests_id_request_fk" FOREIGN KEY ("id_request") REFERENCES "public"."requests"("id_request") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_id_chief_users_id_fk" FOREIGN KEY ("id_chief") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_id_customer_users_id_fk" FOREIGN KEY ("id_customer") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_id_user_users_id_fk" FOREIGN KEY ("id_user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_id_conversation_conversations_id_conversation_fk" FOREIGN KEY ("id_conversation") REFERENCES "public"."conversations"("id_conversation") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_id_sender_users_id_fk" FOREIGN KEY ("id_sender") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" DROP COLUMN "id_service";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "expedition_date_message";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "id_recipient";