import { sql } from "drizzle-orm";
import {
  boolean, check, customType, date, index, integer, jsonb, pgEnum, pgTable, serial, text, timestamp, varchar,
} from "drizzle-orm/pg-core";

export const peranEnum = pgEnum("peran", ["admin", "dapur", "manajer", "pemilik"]);
export const statusPesananEnum = pgEnum("status_pesanan", ["menunggu_dp", "diproses", "dikirim", "selesai", "batal"]);
export const jenisBayarEnum = pgEnum("jenis_bayar", ["uang_muka", "pelunasan"]);
export const metodeBayarEnum = pgEnum("metode_bayar", ["tunai", "transfer"]);

export const pengguna = pgTable("pengguna", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 50 }).notNull(),
  username: varchar("username", { length: 30 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  peran: peranEnum("peran").notNull(),
  aktif: boolean("aktif").notNull().default(true),
});

export const pelanggan = pgTable("pelanggan", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 60 }).notNull(),
  noHp: varchar("no_hp", { length: 15 }).notNull(),
  alamat: varchar("alamat", { length: 150 }).notNull().default(""),
  dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).notNull().defaultNow(),
});

export const menu = pgTable("menu", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  komposisi: text("komposisi").notNull(),
  // uang selalu bilangan bulat rupiah
  harga: integer("harga").notNull(),
  foto: varchar("foto", { length: 120 }),
  aktif: boolean("aktif").notNull().default(true),
}, (t) => [check("menu_harga_positif", sql`${t.harga} > 0`)]);

const bytea = customType<{ data: Buffer }>({ dataType: () => "bytea" });

/** Foto menu yang diunggah admin, disimpan di database agar tidak perlu layanan penyimpanan terpisah. */
export const menuFoto = pgTable("menu_foto", {
  menuId: integer("menu_id").primaryKey().references(() => menu.id, { onDelete: "cascade" }),
  tipe: varchar("tipe", { length: 20 }).notNull(),
  data: bytea("data").notNull(),
  diperbaruiPada: timestamp("diperbarui_pada", { withTimezone: true }).notNull().defaultNow(),
});

export const pesanan = pgTable("pesanan", {
  id: serial("id").primaryKey(),
  kode: varchar("kode", { length: 12 }).notNull().unique(),
  pelangganId: integer("pelanggan_id").notNull().references(() => pelanggan.id),
  penggunaId: integer("pengguna_id").notNull().references(() => pengguna.id),
  tglPesan: date("tgl_pesan").notNull().defaultNow(),
  tglKirim: timestamp("tgl_kirim", { withTimezone: true }).notNull(),
  alamatKirim: varchar("alamat_kirim", { length: 150 }).notNull(),
  catatan: varchar("catatan", { length: 200 }).notNull().default(""),
  total: integer("total").notNull(),
  status: statusPesananEnum("status").notNull().default("menunggu_dp"),
  dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("pesanan_tgl_kirim_idx").on(t.tglKirim),
  index("pesanan_status_idx").on(t.status),
  check("pesanan_total_tidak_negatif", sql`${t.total} >= 0`),
]);

export const detailPesanan = pgTable("detail_pesanan", {
  id: serial("id").primaryKey(),
  pesananId: integer("pesanan_id").notNull().references(() => pesanan.id, { onDelete: "cascade" }),
  menuId: integer("menu_id").notNull().references(() => menu.id),
  jumlah: integer("jumlah").notNull(),
  hargaSatuan: integer("harga_satuan").notNull(),
  subtotal: integer("subtotal").notNull(),
}, (t) => [
  index("detail_pesanan_idx").on(t.pesananId),
  check("detail_jumlah_positif", sql`${t.jumlah} > 0`),
]);

export const pembayaran = pgTable("pembayaran", {
  id: serial("id").primaryKey(),
  pesananId: integer("pesanan_id").notNull().references(() => pesanan.id, { onDelete: "cascade" }),
  penggunaId: integer("pengguna_id").notNull().references(() => pengguna.id),
  tglBayar: date("tgl_bayar").notNull().defaultNow(),
  jenis: jenisBayarEnum("jenis").notNull(),
  metode: metodeBayarEnum("metode").notNull(),
  jumlah: integer("jumlah").notNull(),
}, (t) => [
  index("pembayaran_pesanan_idx").on(t.pesananId),
  check("pembayaran_jumlah_positif", sql`${t.jumlah} > 0`),
]);

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  penggunaId: integer("pengguna_id").references(() => pengguna.id),
  aksi: varchar("aksi", { length: 40 }).notNull(),
  entitas: varchar("entitas", { length: 30 }).notNull(),
  entitasId: varchar("entitas_id", { length: 20 }),
  detail: jsonb("detail"),
  dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).notNull().defaultNow(),
});

export const percobaanLogin = pgTable("percobaan_login", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 30 }).notNull(),
  ip: varchar("ip", { length: 45 }).notNull(),
  dibuatPada: timestamp("dibuat_pada", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("percobaan_login_idx").on(t.username, t.ip, t.dibuatPada),
  index("percobaan_login_ip_idx").on(t.ip, t.dibuatPada),
]);

export type Peran = (typeof peranEnum.enumValues)[number];
export type StatusPesanan = (typeof statusPesananEnum.enumValues)[number];
