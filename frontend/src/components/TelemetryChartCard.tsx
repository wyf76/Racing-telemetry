import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TelemetryChartCardProps<TData> = {
  title: string;
  data: TData[];
  yAxisLabel: string;
  series: Array<{
    color: string;
    dataKey: keyof TData;
    label: string;
  }>;
};

export function TelemetryChartCard<TData extends { distance: number }>({
  title,
  data,
  yAxisLabel,
  series,
}: TelemetryChartCardProps<TData>) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Telemetry
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">{title}</h3>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis
              dataKey="distance"
              tick={{ fill: "#475569", fontSize: 12 }}
              tickFormatter={(value: number) => `${Math.round(value)}m`}
            />
            <YAxis tick={{ fill: "#475569", fontSize: 12 }} width={52} />
            <Tooltip
              contentStyle={{ borderRadius: 8, borderColor: "#cbd5e1" }}
              formatter={(value) => formatTooltipValue(value)}
              labelFormatter={(value: number) => `Distance ${Math.round(value)}m`}
            />
            {series.map((item) => (
              <Line
                key={String(item.dataKey) + item.label}
                type="monotone"
                dataKey={String(item.dataKey)}
                dot={false}
                name={item.label}
                stroke={item.color}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-sm text-slate-600">{yAxisLabel} vs distance</p>
    </section>
  );
}

function formatTooltipValue(value: number | string | Array<number | string> | null) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value ?? "n/a";
}
