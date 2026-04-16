from fastapi import APIRouter, File, HTTPException, UploadFile

from app.crud import get_lap_telemetry, get_latest_session_summary, get_session_summary
from app.database import get_connection
from app.parsers.session_parser import ParseError, parse_session_file
from app.schemas import SessionSummary, TelemetryPoint
from app.services.mock_loader import load_mock_session
from app.services.session_storage import store_session_payload
from app.services.uploads import save_upload

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("/mock", response_model=SessionSummary)
def load_mock() -> SessionSummary:
    return load_mock_session()


@router.post("/upload", response_model=SessionSummary)
def upload_session(file: UploadFile = File(...)) -> SessionSummary:
    saved_path = save_upload(file)

    try:
        payload = parse_session_file(saved_path)
        payload["source_key"] = f"upload-{saved_path.stem}"
        return store_session_payload(payload)
    except ParseError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        file.file.close()


@router.get("/latest", response_model=SessionSummary)
def latest_session() -> SessionSummary:
    with get_connection() as connection:
        summary = get_latest_session_summary(connection)

    if summary is None:
        raise HTTPException(status_code=404, detail="No sessions found")

    return summary


@router.get("/{session_id}", response_model=SessionSummary)
def session_detail(session_id: int) -> SessionSummary:
    with get_connection() as connection:
        summary = get_session_summary(connection, session_id)

    if summary is None:
        raise HTTPException(status_code=404, detail="Session not found")

    return summary


@router.get("/{session_id}/laps/{lap_id}/telemetry", response_model=list[TelemetryPoint])
def lap_telemetry(session_id: int, lap_id: int) -> list[TelemetryPoint]:
    with get_connection() as connection:
        telemetry = get_lap_telemetry(connection, session_id, lap_id)

    if not telemetry:
        raise HTTPException(status_code=404, detail="Telemetry not found for lap")

    return telemetry
