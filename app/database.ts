import { Kysely, PostgresDialect, sql, type Generated } from "kysely";
import pg from "pg";

interface EggnetMonitorTable {
  monster_id: number;
  eggs_donated: number;
  last_update: Generated<Date>;
}

interface EggnetMonitorHistoryTable {
  id: Generated<number>;
  monster_id: number;
  eggs_donated: number;
  timestamp: Generated<Date>;
}

interface EggnetHistoryTable {
  timestamp: Date;
  eggs_donated: number;
}

interface Database {
  EggnetMonitor: EggnetMonitorTable;
  EggnetMonitorHistory: EggnetMonitorHistoryTable;
  eggnet_history: EggnetHistoryTable;
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

export async function getLastUpdate() {
  const result = await db
    .selectFrom("EggnetMonitor")
    .select("last_update")
    .orderBy("last_update", "desc")
    .limit(1)
    .executeTakeFirst();

  return result?.last_update ?? new Date(0);
}

export async function getEggStatus(): Promise<{
  lastUpdate: Date;
  eggs: Record<number, number>;
}> {
  const lastUpdate = await getLastUpdate();

  const monsters = await db.selectFrom("EggnetMonitor").selectAll().execute();

  const eggs = monsters.reduce<Record<number, number>>(
    (acc, r) => ({
      ...acc,
      [r.monster_id]: r.eggs_donated,
    }),
    {},
  );

  return { lastUpdate, eggs };
}

export async function refreshEggnetHistory() {
  await sql`REFRESH MATERIALIZED VIEW eggnet_history`.execute(db);
}
