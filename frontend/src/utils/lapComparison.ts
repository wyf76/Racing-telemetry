import type { Lap, TelemetryPoint } from "../api/types";
import { formatLapTime } from "./time";

export type ComparisonChartPoint = {
  distance: number;
  referenceSpeed: number | null;
  comparisonSpeed: number | null;
  referenceThrottle: number | null;
  comparisonThrottle: number | null;
  referenceBrake: number | null;
  comparisonBrake: number | null;
};

type SegmentSummary = {
  label: string;
  score: number;
  avgSpeedDelta: number;
  avgThrottleDelta: number;
  avgBrakeDelta: number;
};

export function buildComparisonChartData(
  referenceTelemetry: TelemetryPoint[],
  comparisonTelemetry: TelemetryPoint[],
): ComparisonChartPoint[] {
  const distances = Array.from(
    new Set([
      ...referenceTelemetry.map((point) => point.distance),
      ...comparisonTelemetry.map((point) => point.distance),
    ]),
  ).sort((left, right) => left - right);

  return distances.map((distance) => {
    const referencePoint = findClosestPoint(referenceTelemetry, distance);
    const comparisonPoint = findClosestPoint(comparisonTelemetry, distance);

    return {
      distance,
      referenceSpeed: referencePoint?.speed ?? null,
      comparisonSpeed: comparisonPoint?.speed ?? null,
      referenceThrottle: referencePoint?.throttle ?? null,
      comparisonThrottle: comparisonPoint?.throttle ?? null,
      referenceBrake: referencePoint?.brake ?? null,
      comparisonBrake: comparisonPoint?.brake ?? null,
    };
  });
}

export function describeLapDelta(
  referenceLap: Lap | null,
  comparisonLap: Lap | null,
  chartData: ComparisonChartPoint[],
) {
  if (!referenceLap || !comparisonLap) {
    return "Select two laps to compare telemetry.";
  }

  const lapTimeDelta = comparisonLap.lap_time_ms - referenceLap.lap_time_ms;

  if (chartData.length === 0) {
    return lapTimeDelta === 0
      ? "Both laps have the same total lap time and there is no telemetry to compare yet."
      : `The comparison lap is ${formatLapTime(Math.abs(lapTimeDelta))} ${
          lapTimeDelta < 0 ? "faster" : "slower"
        } on total lap time.`;
  }

  // Assumption: without synchronized time samples, the simplest stable comparison is to
  // compare average telemetry over coarse thirds of lap distance. This is only a heuristic.
  const strongestSegment = summarizeSegments(chartData).sort(
    (left, right) => Math.abs(right.score) - Math.abs(left.score),
  )[0];

  if (!strongestSegment || strongestSegment.score === 0) {
    return lapTimeDelta === 0
      ? "The laps are very similar on both total lap time and average telemetry shape."
      : `The comparison lap is ${formatLapTime(Math.abs(lapTimeDelta))} ${
          lapTimeDelta < 0 ? "faster" : "slower"
        }, but the simple telemetry heuristic does not isolate a clear gain/loss segment.`;
  }

  const paceDirection = strongestSegment.score > 0 ? "gained" : "lost";
  const likelyCause =
    strongestSegment.avgSpeedDelta > 0
      ? "carried more average speed"
      : strongestSegment.avgBrakeDelta > 0
        ? "spent more time on the brake"
        : strongestSegment.avgThrottleDelta > 0
          ? "used more throttle"
          : "showed a different telemetry trace";

  return `Compared with the reference lap, the comparison lap is ${formatLapTime(
    Math.abs(lapTimeDelta),
  )} ${lapTimeDelta < 0 ? "faster" : lapTimeDelta > 0 ? "slower" : "different"} overall and likely ${paceDirection} the most time in the ${strongestSegment.label} where it ${likelyCause}.`;
}

function findClosestPoint(
  telemetry: TelemetryPoint[],
  targetDistance: number,
): TelemetryPoint | null {
  if (telemetry.length === 0) {
    return null;
  }

  let bestPoint = telemetry[0];
  let bestDelta = Math.abs(telemetry[0].distance - targetDistance);

  for (const point of telemetry) {
    const delta = Math.abs(point.distance - targetDistance);

    if (delta < bestDelta) {
      bestPoint = point;
      bestDelta = delta;
    }
  }

  return bestPoint;
}

function summarizeSegments(chartData: ComparisonChartPoint[]): SegmentSummary[] {
  const maxDistance = chartData[chartData.length - 1]?.distance ?? 0;
  const segmentSize = maxDistance > 0 ? maxDistance / 3 : 0;

  return ["opening third", "middle third", "final third"].map((label, index) => {
    const lowerBound = segmentSize * index;
    const upperBound = index === 2 ? maxDistance : segmentSize * (index + 1);
    const points = chartData.filter((point) =>
      index === 2
        ? point.distance >= lowerBound && point.distance <= upperBound
        : point.distance >= lowerBound && point.distance < upperBound,
    );

    const avgSpeedDelta = averageDelta(points, "comparisonSpeed", "referenceSpeed");
    const avgThrottleDelta = averageDelta(
      points,
      "comparisonThrottle",
      "referenceThrottle",
    );
    const avgBrakeDelta = averageDelta(points, "comparisonBrake", "referenceBrake");

    // Assumption: higher speed and throttle are mildly positive; more brake is mildly negative.
    const score = avgSpeedDelta * 0.6 + avgThrottleDelta * 20 - avgBrakeDelta * 20;

    return {
      label,
      score,
      avgSpeedDelta,
      avgThrottleDelta,
      avgBrakeDelta,
    };
  });
}

function averageDelta(
  points: ComparisonChartPoint[],
  leftKey: keyof ComparisonChartPoint,
  rightKey: keyof ComparisonChartPoint,
) {
  const deltas = points
    .map((point) => {
      const left = point[leftKey];
      const right = point[rightKey];

      if (typeof left !== "number" || typeof right !== "number") {
        return null;
      }

      return left - right;
    })
    .filter((value): value is number => value !== null);

  if (deltas.length === 0) {
    return 0;
  }

  return deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
}
