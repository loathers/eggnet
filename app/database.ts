import { PrismaClient } from "@prisma/client-generated";

export const prisma = new PrismaClient();

export async function getLastUpdate() {
  return (
    (await prisma.eggnetMonitor.findFirst({ orderBy: { last_update: "desc" } }))
      ?.last_update || new Date(0)
  );
}

export async function getEggStatus(): Promise<{
  lastUpdate: Date;
  eggs: Record<number, number>;
}> {
  const lastUpdate = await getLastUpdate();

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
