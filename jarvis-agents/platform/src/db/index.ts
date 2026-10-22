import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local");

// one pool per server process, reused across hot reloads in dev
const g = globalThis as unknown as { __sql?: ReturnType<typeof postgres> };
export const sql = g.__sql ?? postgres(url, { max: 10 });
if (process.env.NODE_ENV !== "production") g.__sql = sql;

export const db = drizzle(sql, { schema });
export * as t from "./schema";
