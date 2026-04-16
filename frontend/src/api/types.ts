export type HealthResponse = {
  status: string;
  database: string;
  path: string;
};

export type Lap = {
  id: number;
  session_id: number;
  lap_number: number;
  lap_time_ms: number;
  sector1_ms: number | null;
  sector2_ms: number | null;
  sector3_ms: number | null;
  is_valid: boolean;
};

export type TelemetryPoint = {
  id: number;
  lap_id: number;
  lap_number: number;
  sample_index: number;
  distance: number;
  speed: number | null;
  throttle: number | null;
  brake: number | null;
  steering: number | null;
};

export type SessionSummary = {
  id: number;
  source_key: string;
  sim: string;
  track: string;
  car: string;
  session_type: string;
  started_at: string | null;
  best_lap_ms: number | null;
  average_lap_ms: number | null;
  total_laps: number;
  laps: Lap[];
};
