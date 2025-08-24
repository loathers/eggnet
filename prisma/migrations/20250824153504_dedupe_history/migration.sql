/*
  Warnings:

  - A unique constraint covering the columns `[monster_id,eggs_donated]` on the table `EggnetMonitorHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- Delete duplicates keeping the oldest entry
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY monster_id, eggs_donated
      ORDER BY "timestamp" ASC, id ASC
    ) AS rn
  FROM "public"."EggnetMonitorHistory"
)
DELETE FROM "public"."EggnetMonitorHistory" e
USING ranked r
WHERE e.id = r.id
  AND r.rn > 1;

-- CreateIndex
CREATE UNIQUE INDEX "EggnetMonitorHistory_monster_id_eggs_donated_key" ON "public"."EggnetMonitorHistory"("monster_id", "eggs_donated");
