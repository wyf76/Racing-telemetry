import type { HealthResponse } from "../api/types";

type HealthStatusProps = {
  health: HealthResponse | null;
  error: string | null;
  loading: boolean;
  onRefresh: () => void;
};

export function HealthStatus({
  health,
  error,
  loading,
  onRefresh,
}: HealthStatusProps) {
  const isOnline = health?.status === "ok" && health.database === "connected";

  return (
    <section className="panel panel-body w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="section-kicker">Backend Health</p>
          <h2 className="section-title">
            {loading ? "Checking API..." : isOnline ? "API is online" : "API unavailable"}
          </h2>
        </div>
        <button
          className="action-button"
          disabled={loading}
          onClick={onRefresh}
          type="button"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <p className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {health ? (
        <dl className="mt-6 grid gap-3 text-sm md:grid-cols-3">
          <div className="metric-card">
            <dt className="field-label">Status</dt>
            <dd className="mt-2 text-base font-semibold text-slate-950">{health.status}</dd>
          </div>
          <div className="metric-card">
            <dt className="field-label">Database</dt>
            <dd className="mt-2 text-base font-semibold text-slate-950">{health.database}</dd>
          </div>
          <div className="metric-card md:col-span-3">
            <dt className="field-label">SQLite Path</dt>
            <dd className="mt-2 break-all font-mono text-xs text-slate-950">
              {health.path}
            </dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
