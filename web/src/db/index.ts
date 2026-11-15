import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL belum diatur");

// satu koneksi dipakai ulang saat hot reload; prepare:false agar aman lewat connection pooler
const g = globalThis as { __pg?: ReturnType<typeof postgres> };
const client = g.__pg ?? postgres(url, { max: 5, prepare: false });
if (process.env.NODE_ENV !== "production") g.__pg = client;

export const db = drizzle(client, { schema });
export { client };
