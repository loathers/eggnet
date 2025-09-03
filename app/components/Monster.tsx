import React, { useState } from "react";
import { clsx } from "clsx";
import { decodeHTML } from "entities";

import { History } from "./History.js";
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
  history: { timestamp: Date; eggs_donated: number }[];
};

interface MonsterProps {
  monster: MonsterType;
}

export const Monster: React.FC<MonsterProps> = ({ monster }) => {
  const image = Array.isArray(monster.image) ? monster.image[0] : monster.image;

  const [isOpen, setIsOpen] = useState(false);

  const name = decodeHTML(monster.name);

  return (
    <div className={styles.container}>
      <ProgressBar progress={[monster.eggs, 100]}>
        <div className={styles.monster}>
          <img
            className={styles.monsterImage}
            src={`${IMAGES_SERVER}/adventureimages/${image}`}
            alt={name}
          />
          <p className={styles.monsterName}>
            <a
              href={`${WIKI_WEBPAGE}/${monster.wiki ?? name.replace(/\s/g, "_")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {name}
            </a>
            {monster.eggs === 100 ? "" : ` (${monster.eggs}/100 eggs)`}
          </p>
          {monster.priority > 0 && (
            <p className={styles.monsterBadge}>{badges[monster.priority]}</p>
          )}
          <button
            className={styles.expandButton}
            onClick={() => setIsOpen((o) => !o)}
          >
            📈 {isOpen ? "🔼" : "🔽"}
          </button>
        </div>
        <div
          className={clsx(styles.chartContainer, { [styles.expanded]: isOpen })}
        >
          {isOpen && <History history={monster.history} />}
        </div>
      </ProgressBar>
    </div>
  );
};
