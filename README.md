# Racing Telemetry Dashboard

MVP full-stack scaffold for an iRacing and ACC telemetry dashboard.

## Stack

- Frontend: React, TypeScript, Tailwind, Vite
- Backend: FastAPI
- Database: SQLite

## Project Structure

```text
backend/
  app/
    main.py          FastAPI app entrypoint
    database.py      SQLite connection and schema setup
    settings.py      Backend configuration
    routers/
      health.py      Health endpoint
  data/              Local SQLite database directory

frontend/
  src/
    api/             Backend API client and types
    components/      React components
    styles/          Tailwind entry CSS
    App.tsx          Main dashboard page
```

## Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install .
uvicorn app.main:app --reload
```

The backend runs at `http://127.0.0.1:8000`.

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Load the checked-in mock telemetry session:

```bash
curl -X POST http://127.0.0.1:8000/sessions/mock
```

Fetch the latest stored session summary:

```bash
curl http://127.0.0.1:8000/sessions/latest
```

Upload a JSON or CSV telemetry/session file:

```bash
curl -F "file=@path/to/session.json" http://127.0.0.1:8000/sessions/upload
```

Supported JSON format:

```json
{
  "sim": "ACC",
  "track": "Spa-Francorchamps",
  "car": "Porsche 911 GT3 R",
  "session_type": "Practice",
  "started_at": "2026-04-15T18:30:00Z",
  "laps": [
    {
      "lap_number": 1,
      "lap_time_ms": 142830,
      "is_valid": true,
      "telemetry": [
        {"distance": 0, "speed": 94, "throttle": 0.62, "brake": 0, "steering": 0.03}
      ]
    }
  ]
}
```

Supported CSV columns:

```text
sim,track,car,session_type,started_at,lap_number,lap_time_ms,is_valid,distance,speed,throttle,brake,steering
```

Each CSV row represents one telemetry sample. Session metadata is read from the first row, and rows are grouped by `lap_number`.

## Frontend Setup

Install Node.js 20 or newer, then:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://127.0.0.1:5173`.

By default, the frontend calls `http://127.0.0.1:8000`. To override that:

```bash
VITE_API_URL=http://127.0.0.1:8000 npm run dev
```

## Useful Commands

Backend:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
```

## Current MVP Scope

Implemented in this scaffold:

- FastAPI app
- SQLite initialization
- Backend health endpoint
- React + TypeScript + Tailwind frontend
- Frontend health status card calling the backend
- Mock telemetry JSON fixture
- Mock import endpoint that stores a session, laps, and telemetry points in SQLite
- JSON and CSV upload endpoint
- Session summary UI
- Basic lap table

Planned next:

- Show one telemetry chart
- Parse real iRacing or ACC exports
- HackathonAdaL test marker (2026-05-16)

<!-- adal-guard retest 2026-05-16 -->
