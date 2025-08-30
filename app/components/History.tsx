import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  history: { timestamp: number; eggs_donated: number }[];
};

function DonationTooltip({
  active,
  payload,
  content,
}: {
  active?: boolean;
  payload?: any[];
  content?: any;
}) {
  const isVisible = active && payload && payload.length;
  if (isVisible) {
    console.log(payload);
  }

  const data = payload?.[0]?.payload;

  return (
    <div
      className="custom-tooltip"
      style={{ visibility: isVisible ? "visible" : "hidden" }}
    >
      {isVisible && (
        <>
          <p>{`${data.eggs_donated} @ ${new Date(data.timestamp).toLocaleString(undefined, { timeZoneName: "short" })}`}</p>
        </>
      )}
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
