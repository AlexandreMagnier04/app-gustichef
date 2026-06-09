CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"email" varchar(128) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"firstname" varchar(50) DEFAULT '' NOT NULL,
	"role" varchar(50) DEFAULT 'customer' NOT NULL,
	"localization" varchar(128) DEFAULT '' NOT NULL,
	"upload_profile_picture" date,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chiefs" (
	"id_chief" text PRIMARY KEY NOT NULL,
	"bio_chief" text,
	"note_chief" numeric(2, 1)
);
--> statement-breakpoint
CREATE TABLE "chiefs_specialties" (
	"id_chief" text NOT NULL,
	"id_speciality" integer NOT NULL,
	CONSTRAINT "chiefs_specialties_id_chief_id_speciality_pk" PRIMARY KEY("id_chief","id_speciality")
);
--> statement-breakpoint
CREATE TABLE "images_chef" (
	"id_image" serial PRIMARY KEY NOT NULL,
	"id_chief" text NOT NULL,
	"url" varchar(255) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"date_upload" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "images_menu" (
	"id_image" serial PRIMARY KEY NOT NULL,
	"id_menu" integer NOT NULL,
	"url" varchar(255) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"date_upload" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menus" (
	"id_menu" serial PRIMARY KEY NOT NULL,
	"title_menu" varchar(100) NOT NULL,
	"description_menu" text NOT NULL,
	"price_menu" numeric(5, 2) NOT NULL,
	"type_menu" varchar(10) DEFAULT 'plat' NOT NULL,
	"guests_min" integer,
	"guests_max" integer,
	"ingredients" text[],
	"id_chief" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notices" (
	"id_notice" serial PRIMARY KEY NOT NULL,
	"rating_notice" numeric(2, 1) NOT NULL,
	"comment_notice" text,
	"date_notice" date NOT NULL,
	"id_customer" text NOT NULL,
	"id_chief" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specialties" (
	"id_speciality" serial PRIMARY KEY NOT NULL,
	"name_speciality" varchar(50) NOT NULL,
	"description_speciality" text
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id_customer" text PRIMARY KEY NOT NULL,
	"preferences_customer" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id_request" serial PRIMARY KEY NOT NULL,
	"title_request" varchar(100) NOT NULL,
	"description_request" text NOT NULL,
	"expected_date_request" date NOT NULL,
	"guests_request" integer NOT NULL,
	"type_event_request" varchar(50),
	"localization_request" varchar(100) NOT NULL,
	"statut_request" varchar(50) NOT NULL,
	"id_service" integer,
	"id_customer" text NOT NULL,
	"id_chief" text
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id_service" serial PRIMARY KEY NOT NULL,
	"date_service" date NOT NULL,
	"price_service" numeric(5, 2) NOT NULL,
	"statut_service" varchar(50) NOT NULL,
	"id_customer" text NOT NULL,
	"id_chief" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "images_publication" (
	"id_image" serial PRIMARY KEY NOT NULL,
	"id_publication" integer NOT NULL,
	"url" varchar(255) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"date_upload" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publications" (
	"id_publication" serial PRIMARY KEY NOT NULL,
	"title_publication" varchar(100) NOT NULL,
	"content_publication" text NOT NULL,
	"price_publication" numeric(5, 2),
	"guests_min" integer,
	"guests_max" integer,
	"likes_publication" integer DEFAULT 0 NOT NULL,
	"date_publication" timestamp DEFAULT now() NOT NULL,
	"id_users" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publications_tags" (
	"id_publication" integer NOT NULL,
	"id_tag" integer NOT NULL,
	CONSTRAINT "publications_tags_id_publication_id_tag_pk" PRIMARY KEY("id_publication","id_tag")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id_tag" serial PRIMARY KEY NOT NULL,
	"name_tag" varchar(50) NOT NULL,
	CONSTRAINT "tags_name_tag_unique" UNIQUE("name_tag")
);
--> statement-breakpoint
CREATE TABLE "tags_requests" (
	"id_tag" integer NOT NULL,
	"id_request" integer NOT NULL,
	CONSTRAINT "tags_requests_id_tag_id_request_pk" PRIMARY KEY("id_tag","id_request")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id_message" serial PRIMARY KEY NOT NULL,
	"content_message" text NOT NULL,
	"expedition_date_message" date NOT NULL,
	"read_message" boolean DEFAULT false NOT NULL,
	"id_sender" text NOT NULL,
	"id_recipient" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chiefs" ADD CONSTRAINT "chiefs_id_chief_users_id_fk" FOREIGN KEY ("id_chief") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chiefs_specialties" ADD CONSTRAINT "chiefs_specialties_id_chief_chiefs_id_chief_fk" FOREIGN KEY ("id_chief") REFERENCES "public"."chiefs"("id_chief") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chiefs_specialties" ADD CONSTRAINT "chiefs_specialties_id_speciality_specialties_id_speciality_fk" FOREIGN KEY ("id_speciality") REFERENCES "public"."specialties"("id_speciality") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images_chef" ADD CONSTRAINT "images_chef_id_chief_chiefs_id_chief_fk" FOREIGN KEY ("id_chief") REFERENCES "public"."chiefs"("id_chief") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images_menu" ADD CONSTRAINT "images_menu_id_menu_menus_id_menu_fk" FOREIGN KEY ("id_menu") REFERENCES "public"."menus"("id_menu") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menus" ADD CONSTRAINT "menus_id_chief_chiefs_id_chief_fk" FOREIGN KEY ("id_chief") REFERENCES "public"."chiefs"("id_chief") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notices" ADD CONSTRAINT "notices_id_customer_customers_id_customer_fk" FOREIGN KEY ("id_customer") REFERENCES "public"."customers"("id_customer") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notices" ADD CONSTRAINT "notices_id_chief_chiefs_id_chief_fk" FOREIGN KEY ("id_chief") REFERENCES "public"."chiefs"("id_chief") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_id_customer_users_id_fk" FOREIGN KEY ("id_customer") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_id_customer_customers_id_customer_fk" FOREIGN KEY ("id_customer") REFERENCES "public"."customers"("id_customer") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_id_customer_customers_id_customer_fk" FOREIGN KEY ("id_customer") REFERENCES "public"."customers"("id_customer") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_id_chief_chiefs_id_chief_fk" FOREIGN KEY ("id_chief") REFERENCES "public"."chiefs"("id_chief") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images_publication" ADD CONSTRAINT "fk_images_pub_publication" FOREIGN KEY ("id_publication") REFERENCES "public"."publications"("id_publication") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications" ADD CONSTRAINT "publications_id_users_users_id_fk" FOREIGN KEY ("id_users") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications_tags" ADD CONSTRAINT "publications_tags_id_publication_publications_id_publication_fk" FOREIGN KEY ("id_publication") REFERENCES "public"."publications"("id_publication") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications_tags" ADD CONSTRAINT "publications_tags_id_tag_tags_id_tag_fk" FOREIGN KEY ("id_tag") REFERENCES "public"."tags"("id_tag") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags_requests" ADD CONSTRAINT "tags_requests_id_tag_tags_id_tag_fk" FOREIGN KEY ("id_tag") REFERENCES "public"."tags"("id_tag") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags_requests" ADD CONSTRAINT "tags_requests_id_request_requests_id_request_fk" FOREIGN KEY ("id_request") REFERENCES "public"."requests"("id_request") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_id_sender_users_id_fk" FOREIGN KEY ("id_sender") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_id_recipient_users_id_fk" FOREIGN KEY ("id_recipient") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_localization_idx" ON "users" USING btree ("localization");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");