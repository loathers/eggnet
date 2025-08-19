import clsx from "clsx";

type Props = {
  sort: string;
  onSort: (tab: string) => void;
};

export function Tabbar({ sort, onSort }: Props) {
  return (
    <div className="tabbar">
      <div
        className={clsx("button", { active: sort === "name" })}
        onClick={() => onSort("name")}
      >
        Sort by name
      </div>
      <div
        className={clsx("button", { active: sort === "id" })}
        onClick={() => onSort("id")}
      >
        Sort by ID
      </div>
      <div
        className={clsx("button", { active: sort === "completion" })}
        onClick={() => onSort("completion")}
      >
        Sort by completion
      </div>
      <div
        className={clsx("button", { active: sort === "ascension" })}
        onClick={() => onSort("ascension")}
      >
        Sort by ascension relevance
      </div>
    </div>
  );
}
