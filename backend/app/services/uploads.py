import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.settings import UPLOADS_DIR


def save_upload(file: UploadFile) -> Path:
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

    original_name = Path(file.filename or "telemetry").name
    suffix = Path(original_name).suffix.lower()
    stem = Path(original_name).stem or "telemetry"
    safe_stem = "".join(
        character if character.isalnum() or character in {"-", "_"} else "_"
        for character in stem
    )
    destination = UPLOADS_DIR / f"{safe_stem}-{uuid4().hex[:8]}{suffix}"

    with destination.open("wb") as output:
        shutil.copyfileobj(file.file, output)

    return destination
