import sqlite3

from app.settings import DATA_DIR, DATABASE_PATH


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def initialize_database() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_key TEXT NOT NULL DEFAULT 'manual',
                sim TEXT NOT NULL,
                track TEXT NOT NULL,
                car TEXT NOT NULL,
                session_type TEXT NOT NULL,
                started_at TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        _ensure_column(
            connection,
            table="sessions",
            column="source_key",
            definition="TEXT NOT NULL DEFAULT 'manual'",
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS laps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                lap_number INTEGER NOT NULL,
                lap_time_ms INTEGER NOT NULL,
                sector1_ms INTEGER,
                sector2_ms INTEGER,
                sector3_ms INTEGER,
                is_valid INTEGER NOT NULL DEFAULT 1,
                FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
            )
            """
        )
        _ensure_column(
            connection,
            table="laps",
            column="sector1_ms",
            definition="INTEGER",
        )
        _ensure_column(
            connection,
            table="laps",
            column="sector2_ms",
            definition="INTEGER",
        )
        _ensure_column(
            connection,
            table="laps",
            column="sector3_ms",
            definition="INTEGER",
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS telemetry_points (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lap_id INTEGER NOT NULL,
                sample_index INTEGER NOT NULL,
                distance_m REAL NOT NULL,
                speed_kph REAL,
                throttle REAL,
                brake REAL,
                steering REAL,
                gear INTEGER,
                rpm INTEGER,
                FOREIGN KEY (lap_id) REFERENCES laps (id) ON DELETE CASCADE
            )
            """
        )
        connection.commit()


def _ensure_column(
    connection: sqlite3.Connection, table: str, column: str, definition: str
) -> None:
    columns = connection.execute(f"PRAGMA table_info({table})").fetchall()

    if any(row["name"] == column for row in columns):
        return

    connection.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")


def database_health() -> dict[str, str]:
    with get_connection() as connection:
        connection.execute("SELECT 1")

    return {
        "status": "ok",
        "database": "connected",
        "path": str(DATABASE_PATH),
    }
