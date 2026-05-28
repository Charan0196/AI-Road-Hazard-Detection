## AI Road Hazard Detection System (MVP)

React + FastAPI app where a user uploads a road image/video, YOLO runs detection, and results are stored + shown on a map and analytics dashboard.

### Features (MVP)
- Upload image/video with optional latitude/longitude
- YOLOv8 inference (pothole / obstacle / traffic-like classes depending on weights)
- Persist detections + media in SQLite
- Map view: markers + basic heat points
- Dashboard: totals, counts by class, recent activity

### Backend (FastAPI)

Prereqs:
- Python 3.9+

Setup:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Run:
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Env (optional):
- `DATABASE_URL` (default: `sqlite+aiosqlite:///./app.db`)
- `YOLO_WEIGHTS` (default: `yolov8n.pt`)
- `UPLOAD_DIR` (default: `./uploads`)

### Frontend (React)

Prereqs:
- Node.js 18+

Setup:
```bash
cd frontend
npm install
```

Run:
```bash
cd frontend
npm run dev
```

Frontend env:
- Create `frontend/.env`:
  - `VITE_API_BASE_URL=http://localhost:8000`
  - `VITE_MAP_TILE_URL=...` (optional; default is OpenStreetMap tiles)
  - `VITE_MAP_ATTRIBUTION=...` (optional)
