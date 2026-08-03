CREATE TYPE "public"."linkedin_goal_metric" AS ENUM('posts_published', 'followers', 'connections', 'inbound_leads', 'profile_views', 'comments', 'impressions', 'freelance_leads');--> statement-breakpoint
CREATE TYPE "public"."linkedin_idea_status" AS ENUM('inbox', 'expanded', 'converted', 'archived');--> statement-breakpoint
CREATE TYPE "public"."linkedin_post_status" AS ENUM('idea', 'research', 'draft', 'review', 'ready', 'scheduled', 'published');--> statement-breakpoint
CREATE TABLE "linkedin_pillars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#6366f1' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "linkedin_strategies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"goal" text,
	"posting_frequency" text,
	"target_audience" text,
	"primary_cta" text,
	"success_metric" text,
	"status" "strategy_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "linkedin_post_pillars" (
	"post_id" uuid NOT NULL,
	"pillar_id" uuid NOT NULL,
	CONSTRAINT "linkedin_post_pillars_post_id_pillar_id_pk" PRIMARY KEY("post_id","pillar_id")
);
--> statement-breakpoint
CREATE TABLE "linkedin_strategy_pillars" (
	"strategy_id" uuid NOT NULL,
	"pillar_id" uuid NOT NULL,
	CONSTRAINT "linkedin_strategy_pillars_strategy_id_pillar_id_pk" PRIMARY KEY("strategy_id","pillar_id")
);
--> statement-breakpoint
CREATE TABLE "linkedin_post_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"snapshot" jsonb NOT NULL,
	"edited_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "linkedin_ideas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"reference_links" text[] DEFAULT '{}' NOT NULL,
	"attachment_urls" text[] DEFAULT '{}' NOT NULL,
	"priority" "goal_priority" DEFAULT 'medium' NOT NULL,
	"status" "linkedin_idea_status" DEFAULT 'inbox' NOT NULL,
	"converted_post_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "linkedin_engagement_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"replied_to_comments" boolean DEFAULT false NOT NULL,
	"commented_on_posts" boolean DEFAULT false NOT NULL,
	"connected_with_people" boolean DEFAULT false NOT NULL,
	"replied_to_dms" boolean DEFAULT false NOT NULL,
	"accepted_requests" boolean DEFAULT false NOT NULL,
	"visited_profiles" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "linkedin_engagement_logs_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "linkedin_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"metric" "linkedin_goal_metric" NOT NULL,
	"target_value" integer NOT NULL,
	"current_value" integer DEFAULT 0 NOT NULL,
	"target_date" date,
	"status" "goal_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "linkedin_profile_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"followers" integer,
	"profile_views" integer,
	"connections" integer,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "linkedin_posts" ALTER COLUMN "content" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "linkedin_posts" ALTER COLUMN "scheduled_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "status" "linkedin_post_status" DEFAULT 'idea' NOT NULL;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "day_number" integer;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "topic" text;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "hook" text;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "caption" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "cta" text;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "hashtags" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "carousel_slides" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "image_prompt" text;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "estimated_reading_time" integer;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "target_audience" text;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "is_favorite" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "likes" integer;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "comments" integer;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "shares" integer;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "impressions" integer;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "views" integer;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "followers_gained" integer;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD COLUMN "strategy_id" uuid;--> statement-breakpoint
ALTER TABLE "linkedin_pillars" ADD CONSTRAINT "linkedin_pillars_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linkedin_strategies" ADD CONSTRAINT "linkedin_strategies_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linkedin_post_pillars" ADD CONSTRAINT "linkedin_post_pillars_post_id_linkedin_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."linkedin_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linkedin_post_pillars" ADD CONSTRAINT "linkedin_post_pillars_pillar_id_linkedin_pillars_id_fk" FOREIGN KEY ("pillar_id") REFERENCES "public"."linkedin_pillars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linkedin_strategy_pillars" ADD CONSTRAINT "linkedin_strategy_pillars_strategy_id_linkedin_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."linkedin_strategies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linkedin_strategy_pillars" ADD CONSTRAINT "linkedin_strategy_pillars_pillar_id_linkedin_pillars_id_fk" FOREIGN KEY ("pillar_id") REFERENCES "public"."linkedin_pillars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linkedin_post_revisions" ADD CONSTRAINT "linkedin_post_revisions_post_id_linkedin_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."linkedin_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linkedin_ideas" ADD CONSTRAINT "linkedin_ideas_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linkedin_ideas" ADD CONSTRAINT "linkedin_ideas_converted_post_id_linkedin_posts_id_fk" FOREIGN KEY ("converted_post_id") REFERENCES "public"."linkedin_posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linkedin_engagement_logs" ADD CONSTRAINT "linkedin_engagement_logs_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linkedin_goals" ADD CONSTRAINT "linkedin_goals_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linkedin_profile_snapshots" ADD CONSTRAINT "linkedin_profile_snapshots_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linkedin_posts" ADD CONSTRAINT "linkedin_posts_strategy_id_linkedin_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."linkedin_strategies"("id") ON DELETE set null ON UPDATE no action;