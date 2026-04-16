from typing import Any

from app.crud import get_session_summary
from app.database import get_connection
from app.schemas import SessionSummary


def store_session_payload(payload: dict[str, Any]) -> SessionSummary:
    source_key = payload.get("source_key") or "manual"

    with get_connection() as connection:
        existing = connection.execute(
            "SELECT id FROM sessions WHERE source_key = ?",
            (source_key,),
        ).fetchone()

        if existing is not None:
            connection.execute("DELETE FROM sessions WHERE id = ?", (existing["id"],))

        cursor = connection.execute(
            """
            INSERT INTO sessions (source_key, sim, track, car, session_type, started_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                source_key,
                payload["sim"],
                payload["track"],
                payload["car"],
                payload["session_type"],
                payload.get("started_at"),
            ),
        )
        session_id = cursor.lastrowid

        for lap in payload["laps"]:
            lap_cursor = connection.execute(
                """
                INSERT INTO laps (
                    session_id,
                    lap_number,
                    lap_time_ms,
                    sector1_ms,
                    sector2_ms,
                    sector3_ms,
                    is_valid
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    session_id,
                    lap["lap_number"],
                    lap["lap_time_ms"],
                    lap.get("sector1_ms"),
                    lap.get("sector2_ms"),
                    lap.get("sector3_ms"),
                    1 if lap.get("is_valid", True) else 0,
                ),
            )
            lap_id = lap_cursor.lastrowid

            for sample_index, point in enumerate(lap["telemetry"]):
                connection.execute(
                    """
                    INSERT INTO telemetry_points (
                        lap_id,
                        sample_index,
                        distance_m,
                        speed_kph,
                        throttle,
                        brake,
                        steering
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        lap_id,
                        sample_index,
                        point["distance"],
                        point.get("speed"),
                        point.get("throttle"),
                        point.get("brake"),
                        point.get("steering"),
                    ),
                )

        connection.commit()
        summary = get_session_summary(connection, session_id)

    if summary is None:
        raise RuntimeError("Session was not stored")

    return summary
