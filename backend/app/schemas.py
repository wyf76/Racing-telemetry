from typing import List, Optional

from pydantic import BaseModel


class TelemetryPoint(BaseModel):
    id: int
    lap_id: int
    lap_number: int
    sample_index: int
    distance: float
    speed: Optional[float] = None
    throttle: Optional[float] = None
    brake: Optional[float] = None
    steering: Optional[float] = None


class Lap(BaseModel):
    id: int
    session_id: int
    lap_number: int
    lap_time_ms: int
    sector1_ms: Optional[int] = None
    sector2_ms: Optional[int] = None
    sector3_ms: Optional[int] = None
    is_valid: bool


class Session(BaseModel):
    id: int
    source_key: str
    sim: str
    track: str
    car: str
    session_type: str
    started_at: Optional[str] = None
    created_at: str


class SessionSummary(BaseModel):
    id: int
    source_key: str
    sim: str
    track: str
    car: str
    session_type: str
    started_at: Optional[str] = None
    best_lap_ms: Optional[int]
    average_lap_ms: Optional[int]
    total_laps: int
    laps: List[Lap]
