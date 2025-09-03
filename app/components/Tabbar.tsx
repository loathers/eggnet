import styles from "./Tabbar.module.css";
import { Button } from "./Button.js";

export type Sort = "name" | "id" | "completion" | "ascension";

type Props = {
  sort: Sort;
  onSort: (tab: Sort) => void;
};

export function Tabbar({ sort, onSort }: Props) {
  return (
    <div className={styles.tabbar}>
      <Button active={sort === "name"} onClick={() => onSort("name")}>
        Sort by name
      </Button>
      <Button active={sort === "id"} onClick={() => onSort("id")}>
        Sort by ID
      </Button>
      <Button
        active={sort === "completion"}
        onClick={() => onSort("completion")}
      >
        Sort by completion
      </Button>
      <Button active={sort === "ascension"} onClick={() => onSort("ascension")}>
        Sort by ascension relevance
      </Button>
    </div>
  );
}
