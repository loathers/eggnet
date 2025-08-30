import styles from "./ProgressBar.module.css";

type Props = React.PropsWithChildren<{
  progress: [current: number, total: number];
}>;

export function ProgressBar({ progress, children }: Props) {
  return (
    <div
      suppressHydrationWarning={true}
      className={styles.progressbar}
      style={
        {
          "--percentage": `${(progress[0] / progress[1]) * 100}%`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
