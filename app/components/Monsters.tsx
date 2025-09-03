import { useMemo } from "react";
import { Monster, type MonsterType } from "./Monster.js";
import styles from "./Monsters.module.css";
import type { Sort } from "./Tabbar.js";

type Props = {
  monsters: MonsterType[];
  hideCompleted: boolean;
  sort: Sort;
};

export function Monsters({ monsters, hideCompleted, sort }: Props) {
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
    <div className={styles.monsters}>
      {sorted.map((m) => (
        <Monster key={m.id} monster={m} />
      ))}
    </div>
  );
}
