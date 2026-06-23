CREATE TABLE "reservations" (
	"id_reservation" serial PRIMARY KEY NOT NULL,
	"id_conversation" integer NOT NULL,
	"id_chief" text NOT NULL,
	"id_customer" text NOT NULL,
	"id_menu" integer,
	"title" varchar(200) NOT NULL,
	"price_per_person" integer NOT NULL,
	"guests" integer NOT NULL,
	"event_date" date NOT NULL,
	"event_time" varchar(5),
	"localization" varchar(100) NOT NULL,
	"notes" text,
	"extras_json" json,
	"stripe_payment_intent_id" varchar(255),
	"statut" varchar(50) DEFAULT 'confirme' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_id_conversation_conversations_id_conversation_fk" FOREIGN KEY ("id_conversation") REFERENCES "public"."conversations"("id_conversation") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_id_chief_users_id_fk" FOREIGN KEY ("id_chief") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_id_customer_users_id_fk" FOREIGN KEY ("id_customer") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
