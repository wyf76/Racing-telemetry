import { useEffect, useMemo, useState } from "react";

import { useLapTelemetry } from "../hooks/useLapTelemetry";
import type { Lap, SessionSummary } from "../api/types";
import {
  buildComparisonChartData,
  describeLapDelta,
  type ComparisonChartPoint,
} from "../utils/lapComparison";
import { formatLapTime } from "../utils/time";
import { TelemetryChartCard } from "./TelemetryChartCard";

type LapComparisonPanelProps = {
  session: SessionSummary;
};

export function LapComparisonPanel({ session }: LapComparisonPanelProps) {
  const [referenceLapId, setReferenceLapId] = useState<number | null>(
    session.laps[0]?.id ?? null,
  );
  const [comparisonLapId, setComparisonLapId] = useState<number | null>(
    session.laps[1]?.id ?? session.laps[0]?.id ?? null,
  );

  useEffect(() => {
    setReferenceLapId(session.laps[0]?.id ?? null);
    setComparisonLapId(session.laps[1]?.id ?? session.laps[0]?.id ?? null);
  }, [session.id, session.laps]);
  const referenceTelemetryState = useLapTelemetry(session.id, referenceLapId);
  const comparisonTelemetryState = useLapTelemetry(session.id, comparisonLapId);

  const referenceLap = useMemo(
    () => session.laps.find((lap) => lap.id === referenceLapId) ?? null,
    [referenceLapId, session.laps],
  );
  const comparisonLap = useMemo(
    () => session.laps.find((lap) => lap.id === comparisonLapId) ?? null,
    [comparisonLapId, session.laps],
  );

  const chartData: ComparisonChartPoint[] = useMemo(
    () =>
      buildComparisonChartData(
        referenceTelemetryState.telemetry,
        comparisonTelemetryState.telemetry,
      ),
    [comparisonTelemetryState.telemetry, referenceTelemetryState.telemetry],
  );

  const deltaSummary = useMemo(
    () => describeLapDelta(referenceLap, comparisonLap, chartData),
    [chartData, comparisonLap, referenceLap],
  );
  const loading =
    referenceTelemetryState.loading || comparisonTelemetryState.loading;
  const error = referenceTelemetryState.error ?? comparisonTelemetryState.error;

  return (
    <section className="flex w-full flex-col gap-5">
      <div className="panel panel-body">
        <div className="flex flex-col gap-6">
          <div>
            <p className="section-kicker">Lap Comparison</p>
            <h2 className="section-title">Compare two laps</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Side-by-side sector and telemetry review for quick qualitative lap
              analysis.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <LapSelector
              label="Reference lap"
              laps={session.laps}
              selectedLapId={referenceLapId}
              onChange={setReferenceLapId}
            />
            <LapSelector
              label="Comparison lap"
              laps={session.laps}
              selectedLapId={comparisonLapId}
              onChange={setComparisonLapId}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <LapSummaryCard lap={referenceLap} title="Reference" />
            <LapSummaryCard lap={comparisonLap} title="Comparison" />
          </div>

          <div className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-4">
            <p className="field-label">Delta Summary</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{deltaSummary}</p>
          </div>

          {loading ? (
            <p className="text-sm text-slate-600">Loading comparison telemetry...</p>
          ) : null}

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <TelemetryChartCard
            data={chartData}
            series={[
              { color: "#2563eb", dataKey: "referenceSpeed", label: "Reference lap" },
              { color: "#f59e0b", dataKey: "comparisonSpeed", label: "Comparison lap" },
            ]}
            title="Speed"
            yAxisLabel="km/h"
          />
          <TelemetryChartCard
            data={chartData}
            series={[
              {
                color: "#16a34a",
                dataKey: "referenceThrottle",
                label: "Reference lap",
              },
              {
                color: "#84cc16",
                dataKey: "comparisonThrottle",
                label: "Comparison lap",
              },
            ]}
            title="Throttle"
            yAxisLabel="Input"
          />
          <div className="lg:col-span-2">
            <TelemetryChartCard
              data={chartData}
              series={[
                { color: "#dc2626", dataKey: "referenceBrake", label: "Reference lap" },
                { color: "#fb7185", dataKey: "comparisonBrake", label: "Comparison lap" },
              ]}
              title="Brake"
              yAxisLabel="Input"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

type LapSelectorProps = {
  label: string;
  laps: Lap[];
  selectedLapId: number | null;
  onChange: (lapId: number) => void;
};

function LapSelector({ label, laps, selectedLapId, onChange }: LapSelectorProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      {label}
      <select
        className="select-input"
        onChange={(event) => onChange(Number(event.target.value))}
        value={selectedLapId ?? ""}
      >
        {laps.map((lap) => (
          <option key={lap.id} value={lap.id}>
            Lap {lap.lap_number} · {formatLapTime(lap.lap_time_ms)}
          </option>
        ))}
      </select>
    </label>
  );
}

type LapSummaryCardProps = {
  title: string;
  lap: Lap | null;
};

function LapSummaryCard({ title, lap }: LapSummaryCardProps) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-4">
      <p className="field-label">{title}</p>
      {lap ? (
        <>
          <p className="mt-2 text-xl font-semibold text-slate-950">
            Lap {lap.lap_number}
          </p>
          <dl className="mt-4 grid gap-2 text-sm text-slate-700">
            <div className="flex items-center justify-between gap-4">
              <dt>Lap time</dt>
              <dd className="font-mono text-slate-950">{formatLapTime(lap.lap_time_ms)}</dd>
            </div>
            <SectorRow label="Sector 1" value={lap.sector1_ms} />
            <SectorRow label="Sector 2" value={lap.sector2_ms} />
            <SectorRow label="Sector 3" value={lap.sector3_ms} />
          </dl>
        </>
      ) : (
        <p className="mt-2 text-sm text-slate-600">No lap selected.</p>
      )}
    </div>
  );
}

function SectorRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt>{label}</dt>
      <dd className="font-mono text-slate-950">
        {value === null ? "n/a" : formatLapTime(value)}
      </dd>
    </div>
  );
}
