import { sql, type Kysely } from "kysely";

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Create materialized view for cumulative egg history
  await sql`
    CREATE MATERIALIZED VIEW IF NOT EXISTS "eggnet_history" AS
    WITH "ranked" AS (
      SELECT
        "id",
        "monster_id",
        "eggs_donated",
        "timestamp",
        "eggs_donated"
          - COALESCE(
              LAG("eggs_donated") OVER (
                PARTITION BY "monster_id"
                ORDER BY "timestamp" ASC, "id" ASC
              ),
              0
            ) AS "delta"
      FROM "EggnetMonitorHistory"
    )
    SELECT
      "timestamp",
      CAST(
        SUM("delta") OVER (
          ORDER BY "timestamp" ASC, "id" ASC
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        )
        AS DOUBLE PRECISION
      ) AS "eggs_donated"
    FROM "ranked"
    ORDER BY "timestamp" ASC, "id" ASC
  `.execute(db);
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP MATERIALIZED VIEW IF EXISTS eggnet_history`.execute(db);
}
