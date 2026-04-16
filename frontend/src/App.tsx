import { useCallback, useEffect, useState } from "react";

import { getHealth, getLatestSession, loadMockSession } from "./api/client";
import type { HealthResponse, SessionSummary } from "./api/types";
import { HealthStatus } from "./components/HealthStatus";
import { LapComparisonPanel } from "./components/LapComparisonPanel";
import { LapDetailsPage } from "./components/LapDetailsPage";
import { LapTable } from "./components/LapTable";
import { SessionSummaryPanel } from "./components/SessionSummaryPanel";
import { UploadSession } from "./components/UploadSession";
import { formatLapTime } from "./utils/time";

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [session, setSession] = useState<SessionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);

  const loadHealth = useCallback(async () => {
    setHealthLoading(true);
    setError(null);

    try {
      const result = await getHealth();
      setHealth(result);
    } catch (err) {
      setHealth(null);
      setError(err instanceof Error ? err.message : "Unable to reach backend");
    } finally {
      setHealthLoading(false);
    }
  }, []);

  const loadSession = useCallback(async () => {
    setSessionLoading(true);
    setError(null);

    try {
      const result = await getLatestSession();
      setSession(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load session");
    } finally {
      setSessionLoading(false);
    }
  }, []);

  const importMockSession = useCallback(async () => {
    setSessionLoading(true);
    setError(null);

    try {
      const result = await loadMockSession();
      setSession(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to import mock data");
    } finally {
      setSessionLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHealth();
    void loadSession();
  }, [loadHealth, loadSession]);

  return (
    <div className="app-shell text-slate-950">
      <aside className="app-sidebar hidden lg:flex">
        <div className="px-6 py-8">
          <p className="section-kicker">Portfolio Build</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Racing telemetry dashboard
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Data-focused telemetry review for iRacing and ACC sessions.
          </p>

          <nav className="mt-10 flex flex-col gap-2">
            <SidebarLink href="#overview" label="Overview" />
            <SidebarLink href="#ingest" label="Ingest" />
            <SidebarLink href="#session" label="Session" />
            <SidebarLink href="#lap-details" label="Lap details" />
            <SidebarLink href="#lap-compare" label="Lap compare" />
          </nav>
        </div>

        <div className="border-t border-slate-200/80 px-6 py-5">
          <p className="field-label">Current session</p>
          <p className="mt-2 text-sm font-medium text-slate-950">
            {session ? `${session.track} · ${session.car}` : "No session loaded"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {session ? `${session.total_laps} laps available` : "Upload or load mock data"}
          </p>
        </div>
      </aside>

      <main className="app-main">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:gap-8">
          <header
            className="panel panel-body dashboard-section flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
            id="overview"
          >
            <div className="max-w-3xl">
              <p className="section-kicker">Racing Telemetry</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Session analysis for lap performance
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Upload session files, inspect laps, review telemetry traces, and
                compare where time was gained or lost.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-2xl">
              <div className="metric-card">
                <p className="field-label">Source</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {session?.sim ?? "Waiting"}
                </p>
              </div>
              <div className="metric-card">
                <p className="field-label">Track</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {session?.track ?? "No session"}
                </p>
              </div>
              <div className="metric-card">
                <p className="field-label">Best Lap</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatLapTime(session?.best_lap_ms ?? null, "No data")}
                </p>
              </div>
            </div>
          </header>

          <div className="panel panel-body lg:hidden">
            <nav className="flex flex-wrap gap-2">
              <SidebarLink href="#overview" label="Overview" />
              <SidebarLink href="#ingest" label="Ingest" />
              <SidebarLink href="#session" label="Session" />
              <SidebarLink href="#lap-details" label="Lap details" />
              <SidebarLink href="#lap-compare" label="Lap compare" />
            </nav>
          </div>

          <HealthStatus
            error={error}
            health={health}
            loading={healthLoading}
            onRefresh={loadHealth}
          />

          <section className="dashboard-section" id="ingest">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <UploadSession onUploaded={setSession} />

              <section className="panel panel-body flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <p className="section-kicker">Demo Data</p>
                  <h2 className="section-title">Load mock session</h2>
                  <p className="text-sm leading-6 text-slate-600">
                    Pull in the built-in Spa practice run for quick walkthroughs and
                    screenshots.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="metric-card">
                    <p className="field-label">Available laps</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">4</p>
                  </div>
                  <div className="metric-card">
                    <p className="field-label">Telemetry metrics</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      Speed, throttle, brake
                    </p>
                  </div>
                </div>

                <button
                  className="action-button w-full sm:w-fit"
                  disabled={sessionLoading}
                  onClick={importMockSession}
                  type="button"
                >
                  {sessionLoading ? "Loading..." : "Load Mock Session"}
                </button>

                {!session && !sessionLoading ? (
                  <p className="text-sm text-slate-600">
                    No session has been loaded yet.
                  </p>
                ) : null}
              </section>
            </div>
          </section>

          {session ? (
            <>
              <section className="dashboard-section" id="session">
                <SessionSummaryPanel session={session} />
              </section>
              <LapTable laps={session.laps} />
              <section className="dashboard-section" id="lap-details">
                <LapDetailsPage session={session} />
              </section>
              <section className="dashboard-section" id="lap-compare">
                <LapComparisonPanel session={session} />
              </section>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
      href={href}
    >
      {label}
    </a>
  );
}
