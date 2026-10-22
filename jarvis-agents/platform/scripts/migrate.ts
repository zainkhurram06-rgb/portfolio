// Applies every migration in ./drizzle that has not run yet. Safe to run twice.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
  await migrate(drizzle(sql), { migrationsFolder: "./drizzle" });
  console.log("database is up to date");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
