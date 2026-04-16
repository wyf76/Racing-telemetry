import sqlite3
from typing import List, Optional

from app.schemas import Lap, SessionSummary, TelemetryPoint


def row_to_lap(row: sqlite3.Row) -> Lap:
    return Lap(
        id=row["id"],
        session_id=row["session_id"],
        lap_number=row["lap_number"],
        lap_time_ms=row["lap_time_ms"],
        sector1_ms=row["sector1_ms"],
        sector2_ms=row["sector2_ms"],
        sector3_ms=row["sector3_ms"],
        is_valid=bool(row["is_valid"]),
    )


def row_to_telemetry_point(row: sqlite3.Row) -> TelemetryPoint:
    return TelemetryPoint(
        id=row["id"],
        lap_id=row["lap_id"],
        lap_number=row["lap_number"],
        sample_index=row["sample_index"],
        distance=row["distance_m"],
        speed=row["speed_kph"],
        throttle=row["throttle"],
        brake=row["brake"],
        steering=row["steering"],
    )


def get_session_summary(
    connection: sqlite3.Connection, session_id: int
) -> Optional[SessionSummary]:
    session = connection.execute(
        """
        SELECT id, source_key, sim, track, car, session_type, started_at, created_at
        FROM sessions
        WHERE id = ?
        """,
        (session_id,),
    ).fetchone()

    if session is None:
        return None

    lap_rows = connection.execute(
        """
        SELECT
            id,
            session_id,
            lap_number,
            lap_time_ms,
            sector1_ms,
            sector2_ms,
            sector3_ms,
            is_valid
        FROM laps
        WHERE session_id = ?
        ORDER BY lap_number
        """,
        (session_id,),
    ).fetchall()
    laps = [row_to_lap(row) for row in lap_rows]
    valid_lap_times = [lap.lap_time_ms for lap in laps if lap.is_valid]

    best_lap_ms = min(valid_lap_times) if valid_lap_times else None
    average_lap_ms = (
        round(sum(valid_lap_times) / len(valid_lap_times)) if valid_lap_times else None
    )

    return SessionSummary(
        id=session["id"],
        source_key=session["source_key"],
        sim=session["sim"],
        track=session["track"],
        car=session["car"],
        session_type=session["session_type"],
        started_at=session["started_at"],
        best_lap_ms=best_lap_ms,
        average_lap_ms=average_lap_ms,
        total_laps=len(laps),
        laps=laps,
    )


def get_latest_session_summary(connection: sqlite3.Connection) -> Optional[SessionSummary]:
    session = connection.execute(
        """
        SELECT id
        FROM sessions
        ORDER BY created_at DESC, id DESC
        LIMIT 1
        """
    ).fetchone()

    if session is None:
        return None

    return get_session_summary(connection, session["id"])


def get_lap_telemetry(
    connection: sqlite3.Connection, session_id: int, lap_id: int
) -> List[TelemetryPoint]:
    rows = connection.execute(
        """
        SELECT
            telemetry_points.id,
            telemetry_points.lap_id,
            laps.lap_number,
            telemetry_points.sample_index,
            telemetry_points.distance_m,
            telemetry_points.speed_kph,
            telemetry_points.throttle,
            telemetry_points.brake,
            telemetry_points.steering
        FROM telemetry_points
        INNER JOIN laps ON laps.id = telemetry_points.lap_id
        WHERE telemetry_points.lap_id = ? AND laps.session_id = ?
        ORDER BY telemetry_points.sample_index
        """,
        (lap_id, session_id),
    ).fetchall()

    return [row_to_telemetry_point(row) for row in rows]
