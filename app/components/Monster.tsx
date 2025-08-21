import React from "react";
import styles from "./Monster.module.css";
import { ProgressBar } from "./ProgressBar.js";

const IMAGES_SERVER = "https://d2uyhvukfffg5a.cloudfront.net";
const WIKI_WEBPAGE = "https://kol.coldfront.net/thekolwiki/index.php";

const badges = [
  "default",
  "nice-to-have",
  "needed for folks with missing IotMs",
  "lower priority but still good one",
  "must-have",
];

export type MonsterType = {
  name: string;
  id: number;
  eggs: number;
  image: string | (string | null)[];
  wiki: string | null;
  priority: number;
};

interface MonsterProps {
  monster: MonsterType;
}

export const Monster: React.FC<MonsterProps> = ({ monster }) => {
  const image = Array.isArray(monster.image) ? monster.image[0] : monster.image;
  return (
    <div className={styles.container}>
      <ProgressBar progress={[monster.eggs, 100]}>
        <div className={styles.monster}>
          <img
            className={styles.monsterImage}
            src={`${IMAGES_SERVER}/adventureimages/${image}`}
            alt={monster.name}
          />
          <p className={styles.monsterName}>
            <a
              href={`${WIKI_WEBPAGE}/${monster.wiki ?? monster.name.replace(/\s/g, "_")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {monster.name}
            </a>
            {monster.eggs === 100 ? "" : ` (${monster.eggs}/100 eggs)`}
          </p>
          {monster.priority > 0 && (
            <p className={styles.monsterBadge}>{badges[monster.priority]}</p>
          )}
        </div>
      </ProgressBar>
    </div>
  );
};
