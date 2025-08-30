-- AddForeignKey
ALTER TABLE "public"."EggnetMonitorHistory" ADD CONSTRAINT "EggnetMonitorHistory_monster_id_fkey" FOREIGN KEY ("monster_id") REFERENCES "public"."EggnetMonitor"("monster_id") ON DELETE RESTRICT ON UPDATE CASCADE;
