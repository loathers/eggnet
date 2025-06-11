-- CreateTable
CREATE TABLE "EggnetMonitor" (
    "monster_id" INTEGER NOT NULL,
    "eggs_donated" INTEGER NOT NULL,
    "last_update" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EggnetMonitor_pkey" PRIMARY KEY ("monster_id")
);

-- CreateTable
CREATE TABLE "EggnetMonitorHistory" (
    "id" SERIAL NOT NULL,
    "monster_id" INTEGER NOT NULL,
    "eggs_donated" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EggnetMonitorHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EggnetMonitorHistory_monster_id_idx" ON "EggnetMonitorHistory"("monster_id");
