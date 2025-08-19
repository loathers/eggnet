import { useMemo } from "react";
import { createClient } from "data-of-loathing";
import { useLocalStorageState } from "ahooks";

import { Tabbar } from "~/components/Tabbar";
import { Monster } from "~/components/Monster";

import { priorities } from "~/priorities.js";
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
        priority: priorities[m.id] ?? 0,
        eggs: eggs[m.id] ?? 0,
      })) ?? [];

  const progress = [
    monsters.reduce((acc, m) => acc + m.eggs, 0),
    monsters.length * 100,
  ] as const;

  return { lastUpdate, monsters, progress };
}

const numberFormat = new Intl.NumberFormat();
const percentFormat = new Intl.NumberFormat(undefined, {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatProgress([eggs, totalEggs]: [number, number]) {
  return `${numberFormat.format(eggs)} / ${numberFormat.format(totalEggs)} eggs donated (${percentFormat.format(eggs / totalEggs)})`;
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
  loaderData: { monsters, lastUpdate, progress },
}: Route.ComponentProps) {
  const [hideCompleted, setHideCompleted] = useLocalStorageState(
    "hideCompleted",
    { defaultValue: false },
  );
  const [sort, setSort] = useLocalStorageState("sort", {
    defaultValue: "name",
  });

  const sorted = useMemo(() => {
    return monsters
      .filter((m) => !hideCompleted || m.eggs < 100)
      .toSorted((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        if (sort === "id") return a.id - b.id;
        if (sort === "completion") return b.eggs - a.eggs;
        if (sort === "ascension") return b.priority - a.priority;
        return 0;
      });
  }, [monsters, sort, hideCompleted]);

  return (
    <div>
      <p className="header">EggNet Monitor</p>
      <p className="last-update">
        Last update:{" "}
        <time suppressHydrationWarning={true}>
          {lastUpdate.toLocaleString(undefined, { timeZoneName: "short" })}
        </time>
      </p>
      <div className="total-progress">
        <div
          className="barfill"
          style={
            {
              "--percentage": `${(progress[0] / progress[1]) * 100}%`,
            } as React.CSSProperties
          }
        ></div>
        <p className="eggs-total" suppressHydrationWarning={true}>
          {formatProgress(progress)}
        </p>
      </div>
      <Tabbar sort={sort} onSort={setSort} />
      <div className="settings">
        <label>
          <input
            type="checkbox"
            className="setting"
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
