import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Create EggnetMonitor table
  await db.schema
    .createTable("EggnetMonitor")
    .ifNotExists()
    .addColumn("monster_id", "integer", (col) => col.primaryKey())
    .addColumn("eggs_donated", "integer", (col) => col.notNull())
    .addColumn("last_update", "timestamptz", (col) => col.notNull())
    .execute();

  // Create EggnetMonitorHistory table
  await db.schema
    .createTable("EggnetMonitorHistory")
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("monster_id", "integer", (col) =>
      col
        .notNull()
        .references("EggnetMonitor.monster_id")
        .onDelete("restrict")
        .onUpdate("cascade"),
    )
    .addColumn("eggs_donated", "integer", (col) => col.notNull())
    .addColumn("timestamp", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // Create unique constraint on (monster_id, eggs_donated)
  await db.schema
    .createIndex("EggnetMonitorHistory_monster_id_eggs_donated_key")
    .on("EggnetMonitorHistory")
    .ifNotExists()
    .columns(["monster_id", "eggs_donated"])
    .unique()
    .execute();

  // Delete existing _prisma_migrations table if it exists
  await db.schema.dropTable("_prisma_migrations").ifExists().execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("EggnetMonitorHistory").ifExists().execute();
  await db.schema.dropTable("EggnetMonitor").ifExists().execute();
}
