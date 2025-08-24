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

