import { useLocalStorage } from "usehooks-ts";
import { useEffect, useRef } from "react";
import { Fireworks } from "@fireworks-js/react";
import type { FireworksHandlers } from "@fireworks-js/react";

import type { Route } from "./+types/home.js";

import { db, getLastUpdate } from "~/database.js";
import { getMonsterData } from "~/monster-data.js";

import { type Sort, Tabbar } from "~/components/Tabbar.js";
import { Monsters } from "~/components/Monsters.js";
import { formatProgress, TotalProgress } from "~/components/TotalProgress.js";
import { LastUpdate } from "~/components/LastUpdate.js";
import { Footer } from "~/components/Footer.js";
import { Header } from "~/components/Header.js";
import { Settings } from "~/components/Settings.js";
import { useMemo } from "react";

export async function loader() {
  const [lastUpdate, currentEggs, monsterData, history] = await Promise.all([
    getLastUpdate(),
    db
      .selectFrom("EggnetMonitor")
      .select(["monster_id", "eggs_donated"])
      .execute(),
    getMonsterData(),
    db
      .selectFrom("eggnet_history")
      .select(["timestamp", "eggs_donated"])
      .orderBy("timestamp", "asc")
      .execute(),
  ]);

  const monsterEggsById = new Map(
    currentEggs.map((m) => [m.monster_id, m.eggs_donated] as const),
  );

  const monsters = monsterData
    .filter((m) => monsterEggsById.has(m.id))
    .map((m) => ({
      ...m,
      eggs: monsterEggsById.get(m.id) ?? 0,
    }));

  // Ignore nocopy monsters for progress calculation (e.g. embering hulk and infinite meat bug)
  const progressMonsters = monsters.filter((m) => !m.nocopy);

  const progress = [
    progressMonsters.reduce((acc, m) => acc + m.eggs, 0),
    progressMonsters.length * 100,
  ] as const;

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
