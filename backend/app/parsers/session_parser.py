import csv
import json
from collections import defaultdict
from pathlib import Path
from typing import Any, Optional


class ParseError(ValueError):
    pass


def parse_session_file(path: Path) -> dict[str, Any]:
    suffix = path.suffix.lower()

    if suffix == ".json":
        return _parse_json(path)

    if suffix == ".csv":
        return _parse_csv(path)

    raise ParseError("Unsupported file type. Upload a .json or .csv file.")


def _parse_json(path: Path) -> dict[str, Any]:
    try:
        with path.open("r", encoding="utf-8") as file:
            payload = json.load(file)
    except json.JSONDecodeError as exc:
        raise ParseError(f"Invalid JSON: {exc.msg}") from exc

    _validate_payload(payload)
    payload.setdefault("source_key", f"upload-{path.stem}")
    return payload


def _parse_csv(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))

    if not rows:
        raise ParseError("CSV file is empty or missing a header row.")

    first = rows[0]
    required = [
        "sim",
        "track",
        "car",
        "session_type",
        "lap_number",
        "lap_time_ms",
        "distance",
    ]
    missing = [field for field in required if field not in first]

    if missing:
        raise ParseError(f"CSV is missing required columns: {', '.join(missing)}")

    laps_by_number: dict[int, list[dict[str, Any]]] = defaultdict(list)

    for row_index, row in enumerate(rows, start=2):
        try:
            lap_number = int(row["lap_number"])
            lap_time_ms = _required_int(row, "lap_time_ms", row_index)
            is_valid = _optional_bool(row.get("is_valid"), default=True)
            point = {
                "distance": _required_float(row, "distance", row_index),
                "speed": _optional_float(row.get("speed")),
                "throttle": _optional_float(row.get("throttle")),
                "brake": _optional_float(row.get("brake")),
                "steering": _optional_float(row.get("steering")),
            }
        except ValueError as exc:
            raise ParseError(f"Invalid CSV value on row {row_index}: {exc}") from exc

        laps_by_number[lap_number].append(
            {
                "lap_time_ms": lap_time_ms,
                "sector1_ms": _optional_int(row.get("sector1_ms")),
                "sector2_ms": _optional_int(row.get("sector2_ms")),
                "sector3_ms": _optional_int(row.get("sector3_ms")),
                "is_valid": is_valid,
                "telemetry": point,
            }
        )

    laps = []
    for lap_number in sorted(laps_by_number):
        samples = laps_by_number[lap_number]
        laps.append(
            {
                "lap_number": lap_number,
                "lap_time_ms": samples[0]["lap_time_ms"],
                "sector1_ms": samples[0]["sector1_ms"],
                "sector2_ms": samples[0]["sector2_ms"],
                "sector3_ms": samples[0]["sector3_ms"],
                "is_valid": samples[0]["is_valid"],
                "telemetry": [sample["telemetry"] for sample in samples],
            }
        )

    payload = {
        "source_key": first.get("source_key") or f"upload-{path.stem}",
        "sim": first["sim"],
        "track": first["track"],
        "car": first["car"],
        "session_type": first["session_type"],
        "started_at": first.get("started_at") or None,
        "laps": laps,
    }
    _validate_payload(payload)
    return payload


def _validate_payload(payload: dict[str, Any]) -> None:
    required = ["sim", "track", "car", "session_type", "laps"]
    missing = [field for field in required if field not in payload]

    if missing:
        raise ParseError(f"File is missing required fields: {', '.join(missing)}")

    if not isinstance(payload["laps"], list) or not payload["laps"]:
        raise ParseError("File must contain at least one lap.")

    for index, lap in enumerate(payload["laps"], start=1):
        for field in ["lap_number", "lap_time_ms", "telemetry"]:
            if field not in lap:
                raise ParseError(f"Lap {index} is missing required field: {field}")

        if not isinstance(lap["telemetry"], list) or not lap["telemetry"]:
            raise ParseError(f"Lap {index} must contain telemetry samples.")

        for point_index, point in enumerate(lap["telemetry"], start=1):
            if "distance" not in point:
                raise ParseError(
                    f"Lap {index} telemetry sample {point_index} is missing distance."
                )


def _required_float(row: dict[str, str], field: str, row_index: int) -> float:
    value = row.get(field)

    if value in (None, ""):
        raise ValueError(f"{field} is required")

    try:
        return float(value)
    except ValueError as exc:
        raise ValueError(f"{field} must be a number") from exc


def _required_int(row: dict[str, str], field: str, row_index: int) -> int:
    value = row.get(field)

    if value in (None, ""):
        raise ValueError(f"{field} is required")

    try:
        return int(float(value))
    except ValueError as exc:
        raise ValueError(f"{field} must be an integer") from exc


def _optional_float(value: Optional[str]) -> Optional[float]:
    if value in (None, ""):
        return None

    return float(value)


def _optional_int(value: Optional[str]) -> Optional[int]:
    if value in (None, ""):
        return None

    return int(float(value))


def _optional_bool(value: Optional[str], default: bool) -> bool:
    if value in (None, ""):
        return default

    return value.strip().lower() in {"1", "true", "yes", "y", "valid"}
