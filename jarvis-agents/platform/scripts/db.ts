// A real Postgres 16 for your laptop, with nothing to install. Keeps running
// until you close the window (Ctrl+C). Data stays in ./.pgdata between runs.
//
//   npm run db        then, in another window:  npm run db:migrate && npm run seed
import { existsSync } from "node:fs";
import EmbeddedPostgres from "embedded-postgres";

const port = Number(process.env.PGPORT ?? 5433);
const dir = "./.pgdata";

async function main() {
  const pg = new EmbeddedPostgres({ databaseDir: dir, user: "postgres", password: "postgres", port, persistent: true, onLog: () => {} });
  const fresh = !existsSync(dir);
  if (fresh) await pg.initialise();
  await pg.start();
  if (fresh) await pg.createDatabase("platform");
  console.log(`postgres is running: DATABASE_URL=postgres://postgres:postgres@localhost:${port}/platform`);
  console.log("leave this window open. Ctrl+C stops it.");
  const stop = async () => { await pg.stop(); process.exit(0); };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  setInterval(() => {}, 1 << 30);
}

main().catch((e) => { console.error(e); process.exit(1); });
