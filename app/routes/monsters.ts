import { data } from "react-router";
import { prisma } from "~/database.js";
import { priorities } from "~/priorities.js";

export async function loader() {
  try {
    const monsters = await prisma.eggnetMonitor.findMany({});
    return monsters.map((m) => ({
      id: m.monster_id,
      eggs: m.eggs_donated,
      priority: priorities[m.monster_id] ?? 0,
    }));
  } catch (error) {
    console.error("Error fetching egg status:", error);
    return data({ error: "Internal server error" }, 500);
  }
}
