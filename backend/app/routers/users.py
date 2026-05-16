"""User lookup endpoint with safe SQL and env-based configuration."""
import os
import sqlite3
from fastapi import APIRouter, HTTPException

router = APIRouter()

# Configuration loaded from environment (no secrets in source)
DB_PATH = os.environ.get("APP_DB_PATH", "data/app.db")


@router.get("/user")
def get_user(name: str):
    """Return users matching the given name using a parameterized query."""
    if not name or len(name) > 100:
        raise HTTPException(status_code=400, detail="Invalid name parameter")

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT id, name FROM users WHERE name = ?",
            (name,),
        ).fetchall()
        return [dict(r) for r in rows]
