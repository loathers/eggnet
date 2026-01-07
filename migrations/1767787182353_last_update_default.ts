import { sql, type Kysely } from "kysely";

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("EggnetMonitor")
    .alterColumn("last_update", (col) => col.setDefault(sql`now()`))
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("EggnetMonitor")
    .alterColumn("last_update", (col) => col.dropDefault())
    .execute();
}
