import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import styles from "./History.module.css";
import { clsx } from "clsx";

type Props = {
  history: { timestamp: number; eggs_donated: number }[];
};

function DonationTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  const isVisible = active && payload && payload.length;

  const data = payload?.[0]?.payload;
  const content = isVisible
    ? `${data.eggs_donated} @ ${new Date(data.timestamp).toLocaleString(undefined, { timeZoneName: "short" })}`
    : null;

  return (
    <div className={clsx(styles.tooltip, { [styles.visible]: isVisible })}>
      {content}
    </div>
  );
}

export function History({ history }: Props) {
  return (
    <ResponsiveContainer width="100%" height={100}>
      <LineChart data={history}>
        <Tooltip content={<DonationTooltip />} />
        <YAxis hide domain={[0, 100]} />
        <XAxis hide dataKey="timestamp" />
        <Line type="linear" dataKey="eggs_donated" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
