import type { HealthResponse, SessionSummary, TelemetryPoint } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error(`Health check failed with ${response.status}`);
  }

  return response.json();
}

export async function loadMockSession(): Promise<SessionSummary> {
  const response = await fetch(`${API_URL}/sessions/mock`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Mock import failed with ${response.status}`);
  }

  return response.json();
}

export async function uploadSession(file: File): Promise<SessionSummary> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/sessions/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Upload failed"));
  }

  return response.json();
}

export async function getLatestSession(): Promise<SessionSummary | null> {
  const response = await fetch(`${API_URL}/sessions/latest`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Session fetch failed with ${response.status}`);
  }

  return response.json();
}

export async function getLapTelemetry(
  sessionId: number,
  lapId: number,
): Promise<TelemetryPoint[]> {
  const response = await fetch(
    `${API_URL}/sessions/${sessionId}/laps/${lapId}/telemetry`,
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Telemetry fetch failed"));
  }

  return response.json();
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json();

    if (typeof body.detail === "string") {
      return body.detail;
    }
  } catch {
    return `${fallback} with ${response.status}`;
  }

  return `${fallback} with ${response.status}`;
}
