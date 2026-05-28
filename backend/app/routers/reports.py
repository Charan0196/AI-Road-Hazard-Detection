import mimetypes
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from app.core.config import settings
from app.db import get_session
from app.models import Detection, HazardReport, Media
from app.schemas import MediaOut, ReportOut
from app.services.detector import detect_image_file, detect_video_file

router = APIRouter(prefix="/api/reports", tags=["reports"])


def _media_url(media: Media) -> str:
    name = Path(media.path).name
    return f"/uploads/{name}"


def _is_video(content_type: str, filename: str) -> bool:
    if content_type.startswith("video/"):
        return True
    guessed, _ = mimetypes.guess_type(filename)
    return bool(guessed and guessed.startswith("video/"))


@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
async def create_report(
    file: UploadFile = File(...),
    latitude: float | None = Form(default=None),
    longitude: float | None = Form(default=None),
    session: AsyncSession = Depends(get_session),
):
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename or "").suffix
    stored_name = f"{uuid.uuid4()}{ext}"
    stored_path = upload_dir / stored_name

    try:
        content = await file.read()
        stored_path.write_bytes(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}") from e

    content_type = file.content_type or (mimetypes.guess_type(file.filename or "")[0] or "application/octet-stream")

    media = Media(filename=file.filename or stored_name, content_type=content_type, path=str(stored_path))
    report = HazardReport(media=media, latitude=latitude, longitude=longitude)

    try:
        if _is_video(content_type, file.filename or stored_name):
            boxes = detect_video_file(str(stored_path))
        else:
            boxes = detect_image_file(str(stored_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}") from e

    for b in boxes:
        report.detections.append(
            Detection(
                label=b.label,
                confidence=b.confidence,
                x1=b.x1,
                y1=b.y1,
                x2=b.x2,
                y2=b.y2,
            )
        )

    session.add(report)
    await session.commit()

    await session.refresh(report)
    await session.refresh(report.media)
    result = ReportOut(
        id=report.id,
        latitude=report.latitude,
        longitude=report.longitude,
        created_at=report.created_at,
        media=MediaOut(
            id=report.media.id,
            filename=report.media.filename,
            content_type=report.media.content_type,
            url=_media_url(report.media),
        ),
        detections=[d for d in report.detections],
    )
    return result


@router.get("", response_model=list[ReportOut])
async def list_reports(
    limit: int = 50,
    session: AsyncSession = Depends(get_session),
):
    q = (
        select(HazardReport)
        .order_by(HazardReport.created_at.desc())
        .limit(max(1, min(limit, 200)))
    )
    rows = (await session.execute(q)).scalars().unique().all()

    items: list[ReportOut] = []
    for r in rows:
        await session.refresh(r, attribute_names=["media", "detections"])
        items.append(
            ReportOut(
                id=r.id,
                latitude=r.latitude,
                longitude=r.longitude,
                created_at=r.created_at,
                media=MediaOut(
                    id=r.media.id,
                    filename=r.media.filename,
                    content_type=r.media.content_type,
                    url=_media_url(r.media),
                ),
                detections=[d for d in r.detections],
            )
        )
    return items


@router.get("/{report_id}", response_model=ReportOut)
async def get_report(
    report_id: str,
    session: AsyncSession = Depends(get_session),
):
    r = await session.get(HazardReport, report_id)
    if r is None:
        raise HTTPException(status_code=404, detail="Report not found")
    await session.refresh(r, attribute_names=["media", "detections"])
    return ReportOut(
        id=r.id,
        latitude=r.latitude,
        longitude=r.longitude,
        created_at=r.created_at,
        media=MediaOut(
            id=r.media.id,
            filename=r.media.filename,
            content_type=r.media.content_type,
            url=_media_url(r.media),
        ),
        detections=[d for d in r.detections],
    )
