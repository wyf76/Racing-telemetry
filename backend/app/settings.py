from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATABASE_PATH = DATA_DIR / "racing_telemetry.db"
UPLOADS_DIR = BASE_DIR / "uploads"

API_TITLE = "Racing Telemetry API"
API_VERSION = "0.1.0"
