from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Hand API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SessionCreate(BaseModel):
    client: Literal["web"] = "web"

class DetectionEvent(BaseModel):
    session_id: str
    hand: str = Field(min_length=1, max_length=20)
    gesture: str = Field(min_length=1, max_length=40)
    confidence: float = Field(ge=0, le=1)
    timestamp: float

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "hand-api", "time": datetime.now(timezone.utc).isoformat()}

@app.post("/api/sessions")
def create_session(payload: SessionCreate):
    return {"session_id": str(uuid4()), "created_at": datetime.now(timezone.utc).isoformat()}

@app.post("/api/events")
def record_event(event: DetectionEvent):
    # Intentionally lightweight: telemetry is accepted without making video inference depend on the backend.
    return {"accepted": True, "session_id": event.session_id}
