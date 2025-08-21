import { Monster, type MonsterType } from "./Monster.js";
import styles from "./Monsters.module.css";

type Props = {
  monsters: MonsterType[];
};

export function Monsters({ monsters }: Props) {
  return (
    <div className={styles.monsters}>
      {monsters.map((m) => (
        <Monster key={m.id} monster={m} />
      ))}
    </div>
  );
}
