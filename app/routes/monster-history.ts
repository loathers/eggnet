import type { Route } from "./+types/monster-history.js";
import { data } from "react-router";
import { db } from "~/database.js";

export async function loader({ params }: Route.LoaderArgs) {
  const monsterId = Number(params.id);

  if (isNaN(monsterId)) {
    return data({ error: "Invalid monster ID" }, 400);
  }

  const history = await db
    .selectFrom("EggnetMonitorHistory")
    .select(["timestamp", "eggs_donated"])
    .where("monster_id", "=", monsterId)
    .orderBy("timestamp", "asc")
    .execute();

  return history;
}
