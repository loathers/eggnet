import React from "react";

const IMAGES_SERVER = "https://d2uyhvukfffg5a.cloudfront.net";
const WIKI_WEBPAGE = "https://kol.coldfront.net/thekolwiki/index.php";

const badges = [
  "default",
  "nice-to-have",
  "needed for folks with missing IotMs",
  "lower priority but still good one",
  "must-have",
];

interface MonsterProps {
  monster: {
    name: string;
    id: number;
    eggs: number;
    image: string | (string | null)[];
    wiki: string | null;
    priority: number;
  };
}

export const Monster: React.FC<MonsterProps> = ({ monster }) => {
  const image = Array.isArray(monster.image) ? monster.image[0] : monster.image;
  return (
    <div className="monster">
      <div
        className="barfill"
        style={{ "--percentage": `${monster.eggs}%` } as React.CSSProperties}
      />
      <img
        className="monster-image"
        src={`${IMAGES_SERVER}/adventureimages/${image}`}
        alt={monster.name}
      />
      <p className="monster-name">
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
        <p className="monster-badge">{badges[monster.priority]}</p>
      )}
    </div>
  );
};
