import { useEffect, useState } from "react";

import { getLapTelemetry } from "../api/client";
import type { TelemetryPoint } from "../api/types";

type UseLapTelemetryResult = {
  telemetry: TelemetryPoint[];
  loading: boolean;
  error: string | null;
};

export function useLapTelemetry(
  sessionId: number,
  lapId: number | null,
): UseLapTelemetryResult {
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTelemetry() {
      if (lapId === null) {
        setTelemetry([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getLapTelemetry(sessionId, lapId);
        setTelemetry(result);
      } catch (err) {
        setTelemetry([]);
        setError(
          err instanceof Error ? err.message : "Unable to load lap telemetry",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadTelemetry();
  }, [lapId, sessionId]);

  return { telemetry, loading, error };
}
