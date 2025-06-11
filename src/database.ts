import { PrismaClient } from "./generated/prisma";

export const prisma = new PrismaClient();

export async function getEggStatus(): Promise<{
  last_update: number;
  eggs: Record<number, number>;
}> {
  const rows = await prisma.eggnetMonitor.findMany({});

  let last_update_ts = 0;
  const data: Record<number, number> = {};

  for (const row of rows) {
    const last_update_date = new Date(row.last_update);
    last_update_ts = Math.max(
      last_update_ts,
      Math.floor(last_update_date.getTime() / 1000),
    );
    data[row.monster_id] = row.eggs_donated;
  }

  return { last_update: last_update_ts, eggs: data };
}

export async function updateEggStatus(
  monster_id: number,
  eggs_donated: number,
): Promise<void> {
  await prisma.eggnetMonitor.upsert({
    where: { monster_id },
    update: { eggs_donated },
    create: {
      monster_id,
      eggs_donated,
    },
  });

  await prisma.eggnetMonitorHistory.create({
    data: {
      monster_id,
      eggs_donated,
    },
  });
}
