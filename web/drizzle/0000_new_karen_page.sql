CREATE TYPE "public"."jenis_bayar" AS ENUM('uang_muka', 'pelunasan');--> statement-breakpoint
CREATE TYPE "public"."metode_bayar" AS ENUM('tunai', 'transfer');--> statement-breakpoint
CREATE TYPE "public"."peran" AS ENUM('admin', 'dapur', 'manajer', 'pemilik');--> statement-breakpoint
CREATE TYPE "public"."status_pesanan" AS ENUM('menunggu_dp', 'diproses', 'dikirim', 'selesai', 'batal');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"pengguna_id" integer,
	"aksi" varchar(40) NOT NULL,
	"entitas" varchar(30) NOT NULL,
	"entitas_id" varchar(20),
	"detail" jsonb,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "detail_pesanan" (
	"id" serial PRIMARY KEY NOT NULL,
	"pesanan_id" integer NOT NULL,
	"menu_id" integer NOT NULL,
	"jumlah" integer NOT NULL,
	"harga_satuan" integer NOT NULL,
	"subtotal" integer NOT NULL,
	CONSTRAINT "detail_jumlah_positif" CHECK ("detail_pesanan"."jumlah" > 0)
);
--> statement-breakpoint
CREATE TABLE "menu" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(50) NOT NULL,
	"slug" varchar(60) NOT NULL,
	"komposisi" text NOT NULL,
	"harga" integer NOT NULL,
	"foto" varchar(120),
	"aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "menu_slug_unique" UNIQUE("slug"),
	CONSTRAINT "menu_harga_positif" CHECK ("menu"."harga" > 0)
);
--> statement-breakpoint
CREATE TABLE "pelanggan" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(60) NOT NULL,
	"no_hp" varchar(15) NOT NULL,
	"alamat" varchar(150) DEFAULT '' NOT NULL,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pembayaran" (
	"id" serial PRIMARY KEY NOT NULL,
	"pesanan_id" integer NOT NULL,
	"pengguna_id" integer NOT NULL,
	"tgl_bayar" date DEFAULT now() NOT NULL,
	"jenis" "jenis_bayar" NOT NULL,
	"metode" "metode_bayar" NOT NULL,
	"jumlah" integer NOT NULL,
	CONSTRAINT "pembayaran_jumlah_positif" CHECK ("pembayaran"."jumlah" > 0)
);
--> statement-breakpoint
CREATE TABLE "pengguna" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(50) NOT NULL,
	"username" varchar(30) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"peran" "peran" NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "pengguna_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "percobaan_login" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(30) NOT NULL,
	"berhasil" boolean NOT NULL,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pesanan" (
	"id" serial PRIMARY KEY NOT NULL,
	"kode" varchar(12) NOT NULL,
	"pelanggan_id" integer NOT NULL,
	"pengguna_id" integer NOT NULL,
	"tgl_pesan" date DEFAULT now() NOT NULL,
	"tgl_kirim" timestamp with time zone NOT NULL,
	"alamat_kirim" varchar(150) NOT NULL,
	"catatan" varchar(200) DEFAULT '' NOT NULL,
	"total" integer NOT NULL,
	"status" "status_pesanan" DEFAULT 'menunggu_dp' NOT NULL,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pesanan_kode_unique" UNIQUE("kode"),
	CONSTRAINT "pesanan_total_tidak_negatif" CHECK ("pesanan"."total" >= 0)
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_pengguna_id_pengguna_id_fk" FOREIGN KEY ("pengguna_id") REFERENCES "public"."pengguna"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detail_pesanan" ADD CONSTRAINT "detail_pesanan_pesanan_id_pesanan_id_fk" FOREIGN KEY ("pesanan_id") REFERENCES "public"."pesanan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detail_pesanan" ADD CONSTRAINT "detail_pesanan_menu_id_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menu"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_pesanan_id_pesanan_id_fk" FOREIGN KEY ("pesanan_id") REFERENCES "public"."pesanan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_pengguna_id_pengguna_id_fk" FOREIGN KEY ("pengguna_id") REFERENCES "public"."pengguna"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pesanan" ADD CONSTRAINT "pesanan_pelanggan_id_pelanggan_id_fk" FOREIGN KEY ("pelanggan_id") REFERENCES "public"."pelanggan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pesanan" ADD CONSTRAINT "pesanan_pengguna_id_pengguna_id_fk" FOREIGN KEY ("pengguna_id") REFERENCES "public"."pengguna"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "detail_pesanan_idx" ON "detail_pesanan" USING btree ("pesanan_id");--> statement-breakpoint
CREATE INDEX "pembayaran_pesanan_idx" ON "pembayaran" USING btree ("pesanan_id");--> statement-breakpoint
CREATE INDEX "percobaan_login_idx" ON "percobaan_login" USING btree ("username","dibuat_pada");--> statement-breakpoint
CREATE INDEX "pesanan_tgl_kirim_idx" ON "pesanan" USING btree ("tgl_kirim");--> statement-breakpoint
CREATE INDEX "pesanan_status_idx" ON "pesanan" USING btree ("status");