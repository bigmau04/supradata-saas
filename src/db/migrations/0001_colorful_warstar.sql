CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "app_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "attendances" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "branches" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "cash_shifts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "coaches" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "expense_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "gyms" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "member_subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "membership_plans" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "member_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "is_clocked_in" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "last_clock_in" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "last_clock_out" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "gyms" ADD COLUMN "tax_id" varchar(50);--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "coach_id" uuid;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "concept" varchar(50) DEFAULT 'membership';--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "void_reason" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "voided_by" uuid;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "voided_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_voided_by_app_users_id_fk" FOREIGN KEY ("voided_by") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;