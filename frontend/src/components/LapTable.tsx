import type { Lap } from "../api/types";
import { formatLapTime } from "../utils/time";

type LapTableProps = {
  laps: Lap[];
};

export function LapTable({ laps }: LapTableProps) {
  return (
    <section className="panel panel-body dashboard-section w-full" id="lap-table">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="section-kicker">Laps</p>
          <h2 className="section-title">Lap Table</h2>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-3 pr-4 font-medium">Lap</th>
              <th className="px-4 py-3 font-medium">Lap Time</th>
              <th className="px-4 py-3 font-medium">S1</th>
              <th className="px-4 py-3 font-medium">S2</th>
              <th className="px-4 py-3 font-medium">S3</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {laps.map((lap) => (
              <tr className="border-b border-slate-100/80" key={lap.id}>
                <td className="py-3 pr-4 font-medium text-slate-950">
                  {lap.lap_number}
                </td>
                <td className="px-4 py-3 font-mono text-slate-700">
                  {formatLapTime(lap.lap_time_ms)}
                </td>
                <td className="px-4 py-3 font-mono text-slate-600">
                  {formatLapTime(lap.sector1_ms)}
                </td>
                <td className="px-4 py-3 font-mono text-slate-600">
                  {formatLapTime(lap.sector2_ms)}
                </td>
                <td className="px-4 py-3 font-mono text-slate-600">
                  {formatLapTime(lap.sector3_ms)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      lap.is_valid
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {lap.is_valid ? "Valid" : "Invalid"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
