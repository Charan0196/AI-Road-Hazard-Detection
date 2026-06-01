# AI Road Hazard Detection System Architecture

## Overview

The system is a full-stack AI application that detects road hazards from uploaded media, stores structured hazard records, and visualizes them on a map and analytics dashboard.

## Architecture Summary

### Frontend
- **Framework:** React + TypeScript + Vite
- **Purpose:** User interface for uploads, map visualization, analytics, and report browsing
- **Key files:**
  - `frontend/src/App.tsx`
  - `frontend/src/components/MapView.tsx`
  - `frontend/src/api.ts`

### Backend
- **Framework:** FastAPI
- **Purpose:** File upload handling, YOLO inference orchestration, persistence, analytics APIs
- **Key files:**
  - `backend/app/main.py`
  - `backend/app/routers/reports.py`
  - `backend/app/routers/analytics.py`
  - `backend/app/services/detector.py`

### AI Layer
- **Model runtime:** YOLOv8 via `ultralytics`
- **Media support:**
  - Image inference from uploaded images
  - Video inference using a representative frame extracted with OpenCV
- **Output:** Detected boxes with label, confidence, and coordinates

### Data Layer
- **Database:** SQLite for MVP
- **ORM:** SQLAlchemy async engine
- **Core entities:**
  - `Media`
  - `HazardReport`
  - `Detection`

### Mapping Layer
- **Library:** Leaflet
- **Base map:** OpenStreetMap by default
- **Visualization:**
  - Marker placement for geotagged reports
  - Circle-based heat overlay for hazard density

## Request Flow

1. User uploads an image or video from the React UI.
2. Frontend sends multipart form data to `POST /api/reports`.
3. FastAPI stores the media file in `UPLOAD_DIR`.
4. YOLOv8 runs inference on the image or sampled video frame.
5. Backend saves:
   - uploaded media metadata
   - report coordinates
   - detection results
6. Frontend fetches:
   - report list from `/api/reports`
   - summary metrics from `/api/analytics/summary`
   - map heat points from `/api/analytics/heatmap`
7. UI renders reports, map overlays, and dashboard analytics.

## High-Level Component Diagram

```text
User
  |
  v
React Frontend (Vercel)
  |
  | HTTP / JSON / multipart
  v
FastAPI Backend (Render / Docker)
  |
  +--> Upload Storage
  |
  +--> YOLOv8 + OpenCV Inference
  |
  +--> SQLite / PostgreSQL Persistence
  |
  v
Analytics + Report APIs
```

## API Surface

### Report APIs
- `POST /api/reports`
- `GET /api/reports`
- `GET /api/reports/{report_id}`

### Analytics APIs
- `GET /api/analytics/summary`
- `GET /api/analytics/heatmap`

## Deployment Architecture

### Frontend Deployment
- Hosted on Vercel
- Root directory: `frontend`
- Environment variable:
  - `VITE_API_BASE_URL`

### Backend Deployment
- Hosted on Render using Docker
- Root directory: `backend`
- Important environment variables:
  - `CORS_ORIGINS`
  - `DATABASE_URL`
  - `UPLOAD_DIR`
  - `YOLO_WEIGHTS`

## Design Decisions

### Why FastAPI
- Lightweight and fast for inference-backed APIs
- Good OpenAPI docs out of the box
- Clean integration with async DB access

### Why React + Vite
- Fast local development
- Simple deployment to Vercel
- Easy component-based dashboard implementation

### Why SQLite for MVP
- Minimal setup
- Good enough for demo and interview prototype
- Easy upgrade path to PostgreSQL

### Why Leaflet
- Simple, lightweight map rendering
- Works well with hazard markers and heat overlays
- Easy to later swap to MapmyIndia-backed tiles or SDK integration

## Future Architecture Extensions

- Replace SQLite with PostgreSQL + PostGIS
- Add GPS ingestion from mobile devices
- Add live stream ingestion for webcam/dashcam feeds
- Add background workers for async inference
- Add municipal dashboard, severity scoring, and route-risk APIs
