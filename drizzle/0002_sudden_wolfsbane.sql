CREATE TABLE "website"."categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "website"."products" ALTER COLUMN "category" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "website"."products" ALTER COLUMN "material" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "website"."products" ALTER COLUMN "finish" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "website"."leads" ADD COLUMN "product_id" text;--> statement-breakpoint
ALTER TABLE "website"."products" ADD COLUMN "category_id" text;--> statement-breakpoint
ALTER TABLE "website"."products" ADD COLUMN "brand" text DEFAULT '' NOT NULL;