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
import { useMemo } from "react";

const START = new Date("2024-01-01").getTime();
const NOW = new Date().getTime();

type Props = {
  history: { timestamp: Date; eggs_donated: number }[];
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
  const data = useMemo(() => {
    return [
      { timestamp: START, eggs_donated: 0 },
      ...history.map((entry) => ({
        ...entry,
        timestamp: entry.timestamp.getTime(),
      })),
      {
        timestamp: NOW,
        eggs_donated: history.at(-1)?.eggs_donated ?? 0,
      },
    ];
  }, [history]);

  return (
    <ResponsiveContainer width="100%" height={100}>
      <LineChart data={data}>
        <Tooltip content={<DonationTooltip />} />
        <YAxis hide domain={[0, 100]} />
        <XAxis type="number" hide domain={[START, NOW]} dataKey="timestamp" />
        <Line type="stepAfter" dataKey="eggs_donated" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
