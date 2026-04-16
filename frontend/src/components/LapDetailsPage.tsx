import { useEffect, useMemo, useState } from "react";

import { useLapTelemetry } from "../hooks/useLapTelemetry";
import type { SessionSummary } from "../api/types";
import { formatLapTime } from "../utils/time";
import { TelemetryChartCard } from "./TelemetryChartCard";

type LapDetailsPageProps = {
  session: SessionSummary;
};

type ChartPoint = {
  distance: number;
  speed: number | null;
  throttle: number | null;
  brake: number | null;
};

export function LapDetailsPage({ session }: LapDetailsPageProps) {
  const [selectedLapId, setSelectedLapId] = useState<number | null>(
    session.laps[0]?.id ?? null,
  );

  useEffect(() => {
    setSelectedLapId(session.laps[0]?.id ?? null);
  }, [session.id, session.laps]);
  const { telemetry, loading, error } = useLapTelemetry(session.id, selectedLapId);

  const selectedLap = useMemo(
    () => session.laps.find((lap) => lap.id === selectedLapId) ?? null,
    [selectedLapId, session.laps],
  );

  const chartData: ChartPoint[] = useMemo(
    () =>
      telemetry.map((point) => ({
        distance: point.distance,
        speed: point.speed,
        throttle: point.throttle,
        brake: point.brake,
      })),
    [telemetry],
  );

  return (
    <section className="flex w-full flex-col gap-5">
      <div className="panel panel-body">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-kicker">Lap Details</p>
            <h2 className="section-title">Selected lap telemetry</h2>
            {selectedLap ? (
              <p className="mt-2 text-sm text-slate-600">
                Lap {selectedLap.lap_number} · {formatLapTime(selectedLap.lap_time_ms)}{" "}
                · {selectedLap.is_valid ? "Valid" : "Invalid"}
              </p>
            ) : null}
          </div>

          <label className="flex min-w-56 flex-col gap-2 text-sm font-medium text-slate-700">
            Choose lap
            <select
              className="select-input"
              onChange={(event) => setSelectedLapId(Number(event.target.value))}
              value={selectedLapId ?? ""}
            >
              {session.laps.map((lap) => (
                <option key={lap.id} value={lap.id}>
                  Lap {lap.lap_number} · {formatLapTime(lap.lap_time_ms)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-600">Loading telemetry...</p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {!loading && !error && chartData.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            No telemetry samples found for this lap.
          </p>
        ) : null}
      </div>

      {chartData.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <TelemetryChartCard
            data={chartData}
            series={[{ color: "#2563eb", dataKey: "speed", label: "Selected lap" }]}
            title="Speed"
            yAxisLabel="km/h"
          />
          <TelemetryChartCard
            data={chartData}
            series={[{ color: "#16a34a", dataKey: "throttle", label: "Selected lap" }]}
            title="Throttle"
            yAxisLabel="Input"
          />
          <div className="lg:col-span-2">
            <TelemetryChartCard
              data={chartData}
              series={[{ color: "#dc2626", dataKey: "brake", label: "Selected lap" }]}
              title="Brake"
              yAxisLabel="Input"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
