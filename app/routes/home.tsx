import { createClient } from "data-of-loathing";
import { useLocalStorage } from "usehooks-ts";
import { useEffect, useRef } from "react";
import { Fireworks } from "@fireworks-js/react";
import type { FireworksHandlers } from "@fireworks-js/react";

import type { Route } from "./+types/home.js";

import { priorities } from "~/priorities.js";
import { db, getLastUpdate } from "~/database.js";

import { type Sort, Tabbar } from "~/components/Tabbar.js";
import { Monsters } from "~/components/Monsters.js";
import { formatProgress, TotalProgress } from "~/components/TotalProgress.js";
import { LastUpdate } from "~/components/LastUpdate.js";
import { Footer } from "~/components/Footer.js";
import { Header } from "~/components/Header.js";
import { Settings } from "~/components/Settings.js";
import { useMemo } from "react";

const client = createClient();

export async function loader() {
  const lastUpdate = await getLastUpdate();

  const data = await db
    .selectFrom("EggnetMonitor as m")
    .innerJoin("EggnetMonitorHistory as h", "m.monster_id", "h.monster_id")
    .select([
      "m.monster_id",
      "m.eggs_donated as current_eggs",
      "h.timestamp",
      "h.eggs_donated as eggs",
    ])
    .orderBy("h.timestamp", "asc")
    .execute();

  const monsterEggsById = Object.groupBy(data, (row) => row.monster_id);

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
        eggs: monsterEggsById[m.id]?.[0]?.current_eggs ?? 0,
        history:
          monsterEggsById[m.id]?.map((r) => ({
            timestamp: r.timestamp,
            eggs_donated: r.eggs,
          })) ?? [],
      })) ?? [];

  // Ignore nocopy monsters for progress calculation (e.g. embering hulk and infinite meat bug)
  const progressMonsters = monsters.filter((m) => !m.nocopy);

  const progress = [
    progressMonsters.reduce((acc, m) => acc + m.eggs, 0),
    progressMonsters.length * 100,
  ] as const;

  const history = await db
    .selectFrom("eggnet_history")
    .select(["timestamp", "eggs_donated"])
    .orderBy("timestamp", "asc")
    .execute();

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
  const ref = useRef<FireworksHandlers>(null);

  const [hideCompleted, setHideCompleted] = useLocalStorage(
    "hideCompleted",
    false,
    { initializeWithValue: false },
  );
  const [sort, setSort] = useLocalStorage<Sort>("sort", "name", {
    initializeWithValue: false,
  });

  const showAscensionRelevant = useMemo(
    () => monsters.filter((m) => m.priority > 0 && m.eggs < 100).length > 0,
    [monsters],
  );

  useEffect(() => {
    if (!ref.current) return;
    if (progress[0] === progress[1]) {
      ref.current.start();
    } else {
      ref.current.stop();
    }
  }, [progress, ref.current]);

  return (
    <div>
      <Header />
      <LastUpdate date={lastUpdate} />
      <TotalProgress history={history} progress={progress} />
      <Tabbar
        sort={sort}
        onSort={setSort}
        showAscensionRelevant={showAscensionRelevant}
      />
      <Settings
        hideCompleted={hideCompleted}
        onChangeHideCompleted={setHideCompleted}
      />
      <Monsters monsters={monsters} hideCompleted={hideCompleted} sort={sort} />
      <Fireworks
        ref={ref}
        options={{ opacity: 0.5 }}
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          position: "fixed",
          pointerEvents: "none",
        }}
      />
      <Footer />
    </div>
  );
}
