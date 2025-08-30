import { ProgressBar } from "./ProgressBar.js";
import { History } from "./History.js";
import styles from "./TotalProgress.module.css";

type Props = {
  progress: [current: number, total: number];
  history: { timestamp: Date; eggs_donated: number }[];
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

export function TotalProgress({ progress, history }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.progressbarContainer}>
        <ProgressBar progress={progress}>
          {formatProgress(progress)}
        </ProgressBar>
      </div>
      <History history={history} max={progress[1]} />
    </div>
  );
}
