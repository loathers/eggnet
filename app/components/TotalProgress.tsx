import { ProgressBar } from "./ProgressBar.js";
import styles from "./TotalProgress.module.css";

type Props = {
  progress: [current: number, total: number];
};

const numberFormat = new Intl.NumberFormat();
const percentFormat = new Intl.NumberFormat(undefined, {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatProgress([eggs, totalEggs]: [number, number]) {
  return `${numberFormat.format(eggs)} / ${numberFormat.format(totalEggs)} eggs donated (${percentFormat.format(eggs / totalEggs)})`;
}

export function TotalProgress({ progress }: Props) {
  return (
    <div className={styles.container} suppressHydrationWarning={true}>
      <ProgressBar progress={progress}>{formatProgress(progress)}</ProgressBar>
    </div>
  );
}
