import json
from pathlib import Path
from typing import Any

from app.schemas import SessionSummary
from app.services.session_storage import store_session_payload


MOCK_SESSION_PATH = Path(__file__).resolve().parents[2] / "mock_data" / "mock_session.json"


def load_mock_session() -> SessionSummary:
    payload = _read_mock_payload()
    return store_session_payload(payload)


def _read_mock_payload() -> dict[str, Any]:
    with MOCK_SESSION_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)
