import styles from "./LastUpdate.module.css";

type Props = {
  date: Date;
};

export function LastUpdate({ date }: Props) {
  return (
    <p className={styles.lastUpdate}>
      Last update:{" "}
      <time suppressHydrationWarning={true}>
        {date.toLocaleString(undefined, { timeZoneName: "short" })}
      </time>
    </p>
  );
}
