import { PrismaClient } from "@prisma/client-generated";

export const prisma = new PrismaClient();

export async function getEggStatus(): Promise<{
  lastUpdate: Date;
  eggs: Record<number, number>;
}> {
  const lastUpdate =
    (await prisma.eggnetMonitor.findFirst({ orderBy: { last_update: "desc" } }))
      ?.last_update || new Date(0);

  const monsters = await prisma.eggnetMonitor.findMany({});
  const eggs = monsters.reduce<Record<number, number>>(
    (acc, r) => ({
      ...acc,
      [r.monster_id]: r.eggs_donated,
    }),
    {},
  );

  return { lastUpdate, eggs };
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
