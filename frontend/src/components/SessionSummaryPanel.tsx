import type { SessionSummary } from "../api/types";
import { formatLapTime } from "../utils/time";

type SessionSummaryPanelProps = {
  session: SessionSummary;
};

export function SessionSummaryPanel({ session }: SessionSummaryPanelProps) {
  return (
    <section className="panel panel-body w-full">
      <div className="flex flex-col gap-2">
        <p className="section-kicker">Session Summary</p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="section-title">{session.track}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {session.car} · {session.session_type} · {session.sim}
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
            Source: {session.source_key}
          </div>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 md:grid-cols-4">
        <div className="metric-card">
          <dt className="field-label">Best Lap</dt>
          <dd className="mt-2 text-2xl font-semibold text-slate-950">
            {formatLapTime(session.best_lap_ms, "No valid laps")}
          </dd>
        </div>
        <div className="metric-card">
          <dt className="field-label">Average Lap</dt>
          <dd className="mt-2 text-2xl font-semibold text-slate-950">
            {formatLapTime(session.average_lap_ms, "No valid laps")}
          </dd>
        </div>
        <div className="metric-card">
          <dt className="field-label">Total Laps</dt>
          <dd className="mt-2 text-2xl font-semibold text-slate-950">
            {session.total_laps}
          </dd>
        </div>
        <div className="metric-card">
          <dt className="field-label">Session Type</dt>
          <dd className="mt-2 text-2xl font-semibold text-slate-950">
            {session.session_type}
          </dd>
        </div>
      </dl>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-4">
          <p className="field-label">Car</p>
          <p className="mt-2 text-sm font-medium text-slate-950">{session.car}</p>
        </div>
        <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-4">
          <p className="field-label">Simulator</p>
          <p className="mt-2 text-sm font-medium text-slate-950">{session.sim}</p>
        </div>
        <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-4">
          <p className="field-label">Started</p>
          <p className="mt-2 text-sm font-medium text-slate-950">
            {session.started_at ?? "Unknown"}
          </p>
        </div>
      </div>
    </section>
  );
}
