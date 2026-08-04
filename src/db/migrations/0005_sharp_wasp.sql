CREATE TYPE "public"."agency_file_entity" AS ENUM('task', 'meeting', 'project', 'note', 'knowledge');--> statement-breakpoint
CREATE TYPE "public"."agency_inbox_source" AS ENUM('slack', 'manager_request', 'voice_note', 'screenshot', 'meeting_action_item', 'idea', 'bug', 'other');--> statement-breakpoint
CREATE TYPE "public"."agency_knowledge_type" AS ENUM('note', 'snippet', 'command', 'link', 'checklist');--> statement-breakpoint
CREATE TYPE "public"."agency_project_health" AS ENUM('on_track', 'at_risk', 'off_track');--> statement-breakpoint
CREATE TYPE "public"."agency_report_type" AS ENUM('daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."agency_task_priority" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."agency_task_source" AS ENUM('manual', 'inbox', 'meeting_action_item');--> statement-breakpoint
CREATE TYPE "public"."agency_task_status" AS ENUM('inbox', 'todo', 'today', 'in_progress', 'blocked', 'waiting_review', 'waiting_client', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."agency_task_type" AS ENUM('feature', 'bug', 'research', 'meeting', 'documentation', 'testing', 'deployment');--> statement-breakpoint
CREATE TYPE "public"."agency_time_log_source" AS ENUM('timer', 'manual');--> statement-breakpoint
CREATE TABLE "agency_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"client" text,
	"status" "project_status" DEFAULT 'planning' NOT NULL,
	"health" "agency_project_health" DEFAULT 'on_track' NOT NULL,
	"deadline" date,
	"github_repo" text,
	"tech_stack" text[] DEFAULT '{}' NOT NULL,
	"links" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_epics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"meeting_date" date NOT NULL,
	"duration_minutes" integer,
	"participants" text[] DEFAULT '{}' NOT NULL,
	"agenda" text,
	"notes" text,
	"decisions" text,
	"action_items" jsonb DEFAULT '[]'::jsonb,
	"recording_url" text,
	"agency_project_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_task_checklist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"title" text NOT NULL,
	"is_done" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_task_dependencies" (
	"task_id" uuid NOT NULL,
	"depends_on_task_id" uuid NOT NULL,
	CONSTRAINT "agency_task_dependencies_task_id_depends_on_task_id_pk" PRIMARY KEY("task_id","depends_on_task_id")
);
--> statement-breakpoint
CREATE TABLE "agency_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "agency_task_status" DEFAULT 'inbox' NOT NULL,
	"priority" "agency_task_priority" DEFAULT 'medium' NOT NULL,
	"task_type" "agency_task_type" DEFAULT 'feature' NOT NULL,
	"due_date" date,
	"start_date" date,
	"completed_date" date,
	"estimated_time" integer,
	"actual_time" integer,
	"labels" text[] DEFAULT '{}' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"source" "agency_task_source" DEFAULT 'manual' NOT NULL,
	"source_type" "agency_inbox_source",
	"raw_capture" text,
	"client_name" text,
	"manager" text,
	"assignee" text,
	"github_url" text,
	"pr_url" text,
	"slack_thread_url" text,
	"figma_url" text,
	"vercel_preview_url" text,
	"production_url" text,
	"goal_id" uuid,
	"agency_project_id" uuid,
	"agency_epic_id" uuid,
	"meeting_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "agency_task_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content_markdown" text DEFAULT '' NOT NULL,
	"agency_project_id" uuid,
	"agency_task_id" uuid,
	"meeting_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"storage_path" text NOT NULL,
	"file_type" text,
	"file_size_bytes" integer,
	"entity_type" "agency_file_entity",
	"entity_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_time_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer NOT NULL,
	"source" "agency_time_log_source" DEFAULT 'timer' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_focus_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"task_id" uuid,
	"planned_minutes" integer NOT NULL,
	"actual_minutes" integer,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"completed" boolean DEFAULT false NOT NULL,
	"pomodoro_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"report_type" "agency_report_type" NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agency_reports_user_id_report_type_period_start_unique" UNIQUE("user_id","report_type","period_start")
);
--> statement-breakpoint
CREATE TABLE "agency_knowledge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"content_type" "agency_knowledge_type" DEFAULT 'note' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"language" text,
	"url" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agency_projects" ADD CONSTRAINT "agency_projects_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_epics" ADD CONSTRAINT "agency_epics_agency_project_id_agency_projects_id_fk" FOREIGN KEY ("agency_project_id") REFERENCES "public"."agency_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_meetings" ADD CONSTRAINT "agency_meetings_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_meetings" ADD CONSTRAINT "agency_meetings_agency_project_id_agency_projects_id_fk" FOREIGN KEY ("agency_project_id") REFERENCES "public"."agency_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_task_checklist" ADD CONSTRAINT "agency_task_checklist_task_id_agency_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."agency_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_task_dependencies" ADD CONSTRAINT "agency_task_dependencies_task_id_agency_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."agency_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_task_dependencies" ADD CONSTRAINT "agency_task_dependencies_depends_on_task_id_agency_tasks_id_fk" FOREIGN KEY ("depends_on_task_id") REFERENCES "public"."agency_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_tasks" ADD CONSTRAINT "agency_tasks_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_tasks" ADD CONSTRAINT "agency_tasks_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_tasks" ADD CONSTRAINT "agency_tasks_agency_project_id_agency_projects_id_fk" FOREIGN KEY ("agency_project_id") REFERENCES "public"."agency_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_tasks" ADD CONSTRAINT "agency_tasks_agency_epic_id_agency_epics_id_fk" FOREIGN KEY ("agency_epic_id") REFERENCES "public"."agency_epics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_tasks" ADD CONSTRAINT "agency_tasks_meeting_id_agency_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."agency_meetings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_task_comments" ADD CONSTRAINT "agency_task_comments_task_id_agency_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."agency_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_task_comments" ADD CONSTRAINT "agency_task_comments_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_notes" ADD CONSTRAINT "agency_notes_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_notes" ADD CONSTRAINT "agency_notes_agency_project_id_agency_projects_id_fk" FOREIGN KEY ("agency_project_id") REFERENCES "public"."agency_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_notes" ADD CONSTRAINT "agency_notes_agency_task_id_agency_tasks_id_fk" FOREIGN KEY ("agency_task_id") REFERENCES "public"."agency_tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_notes" ADD CONSTRAINT "agency_notes_meeting_id_agency_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."agency_meetings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_files" ADD CONSTRAINT "agency_files_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_time_logs" ADD CONSTRAINT "agency_time_logs_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_time_logs" ADD CONSTRAINT "agency_time_logs_task_id_agency_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."agency_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_focus_sessions" ADD CONSTRAINT "agency_focus_sessions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_focus_sessions" ADD CONSTRAINT "agency_focus_sessions_task_id_agency_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."agency_tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_reports" ADD CONSTRAINT "agency_reports_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_knowledge" ADD CONSTRAINT "agency_knowledge_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_activity_logs" ADD CONSTRAINT "agency_activity_logs_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;