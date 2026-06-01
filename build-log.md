# Build Log

## Project

AI Road Hazard Detection System

## Goal

Build a working MVP that:
- detects road hazards from uploaded media
- stores hazard records with coordinates
- shows issues on a live map
- exposes analytics through a dashboard

## Stack Chosen

- Frontend: React + TypeScript + Vite
- Backend: FastAPI
- AI: YOLOv8 + OpenCV
- Database: SQLite
- Map: Leaflet + OpenStreetMap
- Deployment:
  - Frontend on Vercel
  - Backend on Render using Docker

## Build Steps Completed

### 1. Project scaffolding
- Created monorepo structure with `frontend/`, `backend/`, and `docs/`
- Added root `.gitignore`
- Added root `README.md`

### 2. Backend implementation
- Added FastAPI application bootstrap
- Added configuration management in `backend/app/core/config.py`
- Added async SQLAlchemy session setup
- Added database models:
  - `Media`
  - `HazardReport`
  - `Detection`
- Added upload and report APIs
- Added analytics APIs
- Added YOLOv8 + OpenCV inference service

### 3. Frontend implementation
- Created Vite React TypeScript app
- Added upload UI for image/video and coordinates
- Added reports table
- Added analytics dashboard
- Added map view using Leaflet
- Added client API layer and shared TS types

### 4. Documentation and portfolio polish
- Expanded `README.md` with:
  - problem statement
  - features
  - future scope
  - screenshots
  - deployment guidance
- Added screenshots under `docs/screenshots/`
- Added deployment docs and Docker configuration

### 5. Deployment work
- Added `frontend/vercel.json`
- Added `backend/Dockerfile`
- Added `backend/.dockerignore`
- Updated backend Docker startup command to respect Render's `PORT`

## Verification Performed

### Local verification
- Installed backend dependencies in a Python virtual environment
- Compiled backend Python modules successfully
- Installed frontend dependencies with `npm install`
- Built frontend successfully with `npm run build`
- Ran local frontend and backend servers
- Verified frontend preview at `http://localhost:5173/`
- Verified backend docs at `http://localhost:8000/docs`

### Git / repo verification
- Initialized and pushed repository to GitHub
- Added screenshot assets and deployment config

## Key Files Added or Updated

### Backend
- `backend/app/main.py`
- `backend/app/routers/reports.py`
- `backend/app/routers/analytics.py`
- `backend/app/services/detector.py`
- `backend/Dockerfile`

### Frontend
- `frontend/src/App.tsx`
- `frontend/src/components/MapView.tsx`
- `frontend/src/api.ts`
- `frontend/vercel.json`

### Docs
- `README.md`
- `architecture.md`
- `build-log.md`
- `skills.md`

## Issues Encountered

### Render/Docker port binding
- Initial Docker command used a fixed port
- Render expects services to bind to the platform-provided `PORT`
- Fixed by updating Docker startup command to:

```sh
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

### Async SQLAlchemy dependency
- Backend startup initially required `greenlet`
- Added `greenlet` to backend requirements

## Remaining Deployment Checklist

- Ensure Render backend service is redeployed from latest commit
- Set Render env var:
  - `CORS_ORIGINS=https://ai-road-hazard-detection.vercel.app`
- Set Vercel env var:
  - `VITE_API_BASE_URL=https://<your-render-backend>`
- Confirm backend health:
  - `/docs`
  - `/api/analytics/summary`
- Confirm frontend can call backend without CORS errors

## Suggested Next Build Phase

- Add custom-trained road-damage model weights
- Add severity scoring for hazards
- Add Postgres for production persistence
- Add live stream or webcam inference
- Add authenticated admin/municipal dashboard
