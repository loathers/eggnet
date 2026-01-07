import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { clsx } from "clsx";
import { decodeHTML } from "entities";

import { History } from "./History.js";
import styles from "./Monster.module.css";
import { ProgressBar } from "./ProgressBar.js";

const IMAGES_SERVER = "https://d2uyhvukfffg5a.cloudfront.net";
const WIKI_WEBPAGE = "https://wiki.kingdomofloathing.com";

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
  nocopy: boolean;
};

interface MonsterProps {
  monster: MonsterType;
}

export const Monster: React.FC<MonsterProps> = ({ monster }) => {
  const image = Array.isArray(monster.image) ? monster.image[0] : monster.image;

  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher<{ timestamp: string; eggs_donated: number }[]>();

  useEffect(() => {
    if (isOpen && fetcher.state === "idle" && !fetcher.data) {
      fetcher.load(`/monster-history/${monster.id}`);
    }
  }, [isOpen, fetcher, monster.id]);

  const history = fetcher.data?.map((d) => ({
    timestamp: new Date(d.timestamp),
    eggs_donated: d.eggs_donated,
  }));

  const name = decodeHTML(monster.name);

  return (
    <div
      className={clsx(styles.container, { [styles.nocopy]: monster.nocopy })}
    >
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
          {monster.nocopy && (
            <p
              className={styles.monsterBadge}
              title="Was probably added through a bug or as a joke"
            >
              not copyable
            </p>
          )}
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
          {isOpen && fetcher.state === "loading" && (
            <p className={styles.loading}>Loading...</p>
          )}
          {isOpen && history && <History history={history} />}
        </div>
      </ProgressBar>
    </div>
  );
};
