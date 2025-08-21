import clsx from "clsx";
import styles from "./Button.module.css";

type Props = React.PropsWithChildren<{
  onClick: () => void;
  active?: boolean;
}>;

export function Button({ children, onClick, active }: Props) {
  return (
    <button
      className={clsx(styles.button, { [styles.active]: active })}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
