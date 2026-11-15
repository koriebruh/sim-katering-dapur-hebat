CREATE TABLE "menu_foto" (
	"menu_id" integer PRIMARY KEY NOT NULL,
	"tipe" varchar(20) NOT NULL,
	"data" "bytea" NOT NULL,
	"diperbarui_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menu_foto" ADD CONSTRAINT "menu_foto_menu_id_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menu"("id") ON DELETE cascade ON UPDATE no action;