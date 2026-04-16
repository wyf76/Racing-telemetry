from fastapi import APIRouter

from app.database import database_health

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict[str, str]:
    return database_health()
