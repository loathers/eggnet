import { useMemo, useState } from "react";
import { createClient } from "data-of-loathing";

import { Tabbar } from "~/components/Tabbar";
import { Monster } from "~/components/Monster";

import { ranking } from "~/ranking.js";
import { getEggStatus } from "~/database.js";

import type { Route } from "./+types/home";

const client = createClient();

export async function loader() {
  const { lastUpdate, eggs } = await getEggStatus();
  const { allMonsters } = await client.query({
    allMonsters: {
      nodes: {
        name: true,
        id: true,
        image: true,
        wiki: true,
      },
    },
  });

  const monsters =
    allMonsters?.nodes
      .filter((n) => n !== null)
      .filter((m) => eggs[m.id] !== undefined)
      .map((m) => ({
        id: m.id,
        name: m.name,
        image: m.image,
        wiki: m.wiki,
        priority: ranking[m.name] ?? 0,
        eggs: eggs[m.id] ?? 0,
      })) ?? [];

  const progress = [
    monsters.reduce((acc, m) => acc + m.eggs, 0),
    monsters.length * 100,
  ];

  return { lastUpdate, monsters, progress };
}

export function meta({ loaderData: { progress } }: Route.MetaArgs) {
  const numberFormat = new Intl.NumberFormat();
  return [
    { title: "EggNet Monitor" },
    {
      name: "description",
      content: `${numberFormat.format(progress[0])} of ${numberFormat.format(progress[1])} eggs collected!`,
    },
  ];
}

export default function Home({
  loaderData: { monsters, lastUpdate },
}: Route.ComponentProps) {
  const [hideCompleted, setHideCompleted] = useState(false);
  const [sort, setSort] = useState("name");

  const sorted = useMemo(() => {
    return monsters
      .filter((m) => !hideCompleted || m.eggs < 100)
      .toSorted((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        if (sort === "id") return a.id - b.id;
        if (sort === "completion") return a.eggs - b.eggs;
        if (sort === "ascension") return b.priority - a.priority;
        return 0;
      });
  }, [monsters, sort, hideCompleted]);

  return (
    <div id="app">
      <p className="header">EggNet Monitor</p>
      <p className="last-update">
        Last update: <time>{lastUpdate.toLocaleString()}</time>
      </p>
      <div className="total-progress" id="total_progress">
        <div className="barfill"></div>
        <p className="eggs-total"></p>
      </div>
      <Tabbar sort={sort} onSort={setSort} />
      <div className="settings">
        <label>
          <input
            type="checkbox"
            className="setting"
            id="setting_hide_completed"
            onInput={(e) => setHideCompleted(e.currentTarget.checked)}
          />
          Hide fully donated monsters
        </label>
      </div>
      <div className="monsterlist">
        {sorted.map((m) => (
          <Monster key={m.id} monster={m} />
        ))}
      </div>
      <p className="footer">Made by Semenar (#3275442)</p>
    </div>
  );
}
