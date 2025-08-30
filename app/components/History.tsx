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
const numberFormatter = new Intl.NumberFormat();

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
    ? `${numberFormatter.format(data.eggs_donated)} @ ${new Date(data.timestamp).toLocaleString(undefined, { timeZoneName: "short" })}`
    : null;

  return (
    <div className={clsx(styles.tooltip, { [styles.visible]: isVisible })}>
      {content}
    </div>
  );
}

type Props = {
  history: { timestamp: Date; eggs_donated: number }[];
  max?: number;
};

export function History({ history, max = 100 }: Props) {
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
        <YAxis hide domain={[0, max]} />
        <XAxis hide type="number" domain={[START, NOW]} dataKey="timestamp" />
        <Line
          type="stepAfter"
          dataKey="eggs_donated"
          stroke="#8884d8"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
