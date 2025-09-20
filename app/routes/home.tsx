import { createClient } from "data-of-loathing";
import { useLocalStorage } from "usehooks-ts";

import type { Route } from "./+types/home.js";

import { priorities } from "~/priorities.js";
import { getLastUpdate, prisma } from "~/database.js";

import { type Sort, Tabbar } from "~/components/Tabbar.js";
import { Monsters } from "~/components/Monsters.js";
import { formatProgress, TotalProgress } from "~/components/TotalProgress.js";
import { LastUpdate } from "~/components/LastUpdate.js";
import { Footer } from "~/components/Footer.js";
import { Header } from "~/components/Header.js";
import { Settings } from "~/components/Settings.js";

const client = createClient();

export async function loader() {
  const lastUpdate = await getLastUpdate();

  const monsterEggs = await prisma.eggnetMonitor.findMany({
    select: {
      eggs_donated: true,
      monster_id: true,
      history: {
        select: {
          timestamp: true,
          eggs_donated: true,
        },
        orderBy: {
          timestamp: "asc",
        },
      },
    },
  });

  const monsterEggsById = monsterEggs.reduce<
    Record<number, (typeof monsterEggs)[0]>
  >((acc, curr) => {
    acc[curr.monster_id] = curr;
    return acc;
  }, {});

  const { allMonsters } = await client.query({
    allMonsters: {
      nodes: {
        name: true,
        id: true,
        image: true,
        wiki: true,
        nocopy: true,
      },
    },
  });

  const monsters =
    allMonsters?.nodes
      .filter((n) => n !== null)
      .filter((m) => monsterEggsById[m.id] !== undefined)
      .map((m) => ({
        id: m.id,
        name: m.name,
        image: m.image,
        wiki: m.wiki,
        nocopy: m.nocopy,
        priority: priorities[m.id] ?? 0,
        eggs: monsterEggsById[m.id]?.eggs_donated ?? 0,
        history: monsterEggsById[m.id]?.history ?? [],
      })) ?? [];

  // Ignore nocopy monsters for progress calculation (e.g. embering hulk and infinite meat bug)
  const progressMonsters = monsters.filter((m) => !m.nocopy);

  const progress = [
    progressMonsters.reduce((acc, m) => acc + m.eggs, 0),
    progressMonsters.length * 100,
  ] as const;

  const history = await prisma.$queryRaw<
    {
      eggs_donated: number;
      timestamp: Date;
    }[]
  >`
  WITH ranked AS (
    SELECT
      id,
      monster_id,
      eggs_donated,
      timestamp,
      eggs_donated
        - COALESCE(
            LAG(eggs_donated) OVER (
              PARTITION BY monster_id
              ORDER BY timestamp ASC, id ASC
            ),
            0
          ) AS delta
    FROM "EggnetMonitorHistory"
  )
  SELECT
    timestamp,
    CAST(
      SUM(delta) OVER (
        ORDER BY timestamp ASC, id ASC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      )
      AS DOUBLE PRECISION
    ) AS eggs_donated
  FROM ranked
  ORDER BY timestamp ASC, id ASC;
  `;

  return { lastUpdate, monsters, progress, history };
}

export function meta({ loaderData: { progress } }: Route.MetaArgs) {
  return [
    { title: "EggNet Monitor" },
    {
      name: "description",
      content: formatProgress(progress),
    },
  ];
}

export default function Home({
  loaderData: { monsters, lastUpdate, progress, history },
}: Route.ComponentProps) {
  const [hideCompleted, setHideCompleted] = useLocalStorage(
    "hideCompleted",
    false,
    { initializeWithValue: false },
  );
  const [sort, setSort] = useLocalStorage<Sort>("sort", "name", {
    initializeWithValue: false,
  });

  return (
    <div>
      <Header />
      <LastUpdate date={lastUpdate} />
      <TotalProgress history={history} progress={progress} />
      <Tabbar sort={sort} onSort={setSort} />
      <Settings
        hideCompleted={hideCompleted}
        onChangeHideCompleted={setHideCompleted}
      />
      <Monsters monsters={monsters} hideCompleted={hideCompleted} sort={sort} />
      <Footer />
    </div>
  );
}
