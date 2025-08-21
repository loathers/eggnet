import styles from "./Settings.module.css";

type Props = {
  hideCompleted: boolean;
  onChangeHideCompleted: (value: boolean) => void;
};

export function Settings({ hideCompleted, onChangeHideCompleted }: Props) {
  return (
    <div className={styles.settings}>
      <label>
        <input
          type="checkbox"
          className="setting"
          checked={hideCompleted}
          onChange={(e) => onChangeHideCompleted(e.currentTarget.checked)}
        />
        Hide fully donated monsters
      </label>
    </div>
  );
}
